import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppointmentStatus, AttachmentType, LabStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { BookingPublicService } from '../booking-public/booking-public.service';
import { FilesService } from '../files/files.service';
import { FilesGateway } from '../files/files.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { QueueService } from '../queue/queue.service';
import { PatientsService } from '../patients/patients.service';
import { VisitType } from '@prisma/client';
import { UpdatePatientProfileDto } from './dto/update-profile.dto';

@Injectable()
export class PatientPortalService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private appointments: AppointmentsService,
    private bookingPublic: BookingPublicService,
    private files: FilesService,
    private filesGateway: FilesGateway,
    private notifications: NotificationsService,
    private queue: QueueService,
    private patients: PatientsService,
  ) {}

  getQueueStatus(patientId: string) {
    return this.queue.getPatientQueueStatus(patientId);
  }

  /** تسجيل دخول مباشر بالموبايل — بدون رمز OTP */
  async login(phone: string) {
    const normalized = this.patients.normalizePhone(phone);
    let account = await this.prisma.patientAccount.findUnique({
      where: { phone: normalized },
      include: { patient: true },
    });
    if (!account) {
      const patient = await this.prisma.patient.findUnique({ where: { phone: normalized } });
      if (patient) {
        await this.patients.ensurePatientAccount(patient.id, normalized);
        account = await this.prisma.patientAccount.findUnique({
          where: { phone: normalized },
          include: { patient: true },
        });
      }
    }
    if (!account) {
      throw new BadRequestException('لا يوجد حساب بهذا الرقم — احجزي موعداً أو سجّلي من صفحة التسجيل');
    }
    await this.prisma.patientAccount.update({
      where: { id: account.id },
      data: { lastLoginAt: new Date(), otp: null, otpExpiresAt: null },
    });
    const token = this.jwt.sign({
      sub: account.patientId,
      phone: account.phone,
      type: 'patient',
    });
    return { patient: account.patient, token };
  }

  private ageToDateOfBirth(age: number): Date {
    const year = new Date().getFullYear() - age;
    return new Date(year, 0, 1);
  }

  async register(data: {
    name: string;
    phone: string;
    email?: string;
    age?: number;
    address?: string;
  }) {
    const existingAccount = await this.prisma.patientAccount.findUnique({
      where: { phone: data.phone },
    });
    if (existingAccount) {
      throw new BadRequestException('رقم الهاتف مسجل مسبقاً — سجّلي الدخول');
    }

    const dateOfBirth =
      data.age != null && data.age > 0 && data.age < 120
        ? this.ageToDateOfBirth(data.age)
        : undefined;
    const address = data.address?.trim() || undefined;

    let patient = await this.prisma.patient.findUnique({ where: { phone: data.phone } });
    if (patient) {
      patient = await this.prisma.patient.update({
        where: { id: patient.id },
        data: {
          name: data.name,
          email: data.email ?? patient.email,
          address: address ?? patient.address,
          dateOfBirth: dateOfBirth ?? patient.dateOfBirth,
        },
      });
    } else {
      patient = await this.prisma.patient.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          address,
          dateOfBirth,
        },
      });
    }

    await this.prisma.patientAccount.create({
      data: { patientId: patient.id, phone: data.phone.trim(), status: 'active' },
    });
    return this.login(data.phone);
  }

  getDoctors() {
    return this.prisma.user.findMany({
      where: { role: 'doctor' },
      select: { id: true, name: true },
    });
  }

  async updateProfile(patientId: string, dto: UpdatePatientProfileDto) {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('المريضة غير موجودة');

    const dateOfBirth =
      dto.age != null && dto.age > 0 && dto.age < 120
        ? this.ageToDateOfBirth(dto.age)
        : undefined;

    const updated = await this.prisma.patient.update({
      where: { id: patientId },
      data: {
        name: dto.name?.trim() || undefined,
        email: dto.email !== undefined ? dto.email || null : undefined,
        address: dto.address !== undefined ? dto.address.trim() || null : undefined,
        dateOfBirth: dateOfBirth ?? undefined,
      },
    });

    return updated;
  }

  getPatientData(patientId: string) {
    return Promise.all([
      this.prisma.patient.findUnique({ where: { id: patientId } }),
      this.prisma.appointment.findMany({
        where: { patientId },
        orderBy: [{ date: 'desc' }, { time: 'desc' }],
        include: {
          doctor: { select: { name: true } },
          invoice: { select: { id: true, total: true, paid: true, status: true } },
          service: { select: { name: true, price: true } },
        },
      }),
      this.prisma.prescription.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.labTest.findMany({
        where: { patientId },
        orderBy: { requestedDate: 'desc' },
      }),
      this.prisma.pregnancy.findMany({
        where: { patientId, isActive: true },
      }),
      this.prisma.attachment.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
    ]).then(([patient, appointments, prescriptions, labTests, pregnancies, attachments]) => ({
      patient,
      appointments,
      prescriptions,
      labTests,
      pregnancies,
      attachments,
    }));
  }

  private async resolveLabRequestedById(): Promise<string> {
    const doctor = await this.prisma.user.findFirst({
      where: { role: UserRole.doctor },
      orderBy: { createdAt: 'asc' },
    });
    if (doctor) return doctor.id;
    const fallback = await this.prisma.user.findFirst({
      where: { role: { in: [UserRole.admin, UserRole.reception] } },
    });
    if (!fallback) throw new BadRequestException('لا يوجد مستخدم للنظام');
    return fallback.id;
  }

  private async notifyDoctorPatientUpload(
    patientId: string,
    patientName: string,
    kind: 'lab' | 'sonar',
    label: string,
    labTestId?: string,
  ) {
    const title =
      kind === 'sonar'
        ? `${patientName} رفعت صورة أشعة / سونار`
        : `${patientName} رفعت صورة تحليل`;
    await this.notifications.create({
      type: 'lab_upload',
      title,
      body: label,
      link: `/app/patients/${patientId}`,
      patientId,
      labTestId,
    });
    this.filesGateway.emitPatientFilesUpdated(patientId);
  }

  /** رفع تحليل أو أشعة من بوابة المريضة (بدون طلب مسبق من العيادة) */
  async uploadPatientMedicalFile(
    patientId: string,
    file: Express.Multer.File,
    category: 'lab' | 'sonar',
    testName?: string,
  ) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { name: true },
    });
    if (!patient) throw new NotFoundException('المريضة غير موجودة');

    const attachmentType =
      category === 'sonar' ? AttachmentType.sonar : AttachmentType.document;
    const uploaded = await this.files.upload(file, patientId, undefined, attachmentType);

    let labTest: { id: string; testName: string } | null = null;
    const label =
      testName?.trim() ||
      (category === 'sonar' ? 'أشعة / سونار' : 'تحليل مرفوع من المريضة');

    if (category === 'lab') {
      labTest = await this.prisma.labTest.create({
        data: {
          patientId,
          requestedById: await this.resolveLabRequestedById(),
          testName: label,
          status: LabStatus.in_progress,
          attachment: uploaded.filePath,
          results: {
            value: 'صورة مرفوعة من المريضة',
            notes: 'بانتظار مراجعة الطبيب',
          },
        },
      });
    }

    await this.notifyDoctorPatientUpload(
      patientId,
      patient.name,
      category,
      label,
      labTest?.id,
    );

    return { attachment: uploaded, labTest };
  }

  async bookAppointment(
    patientId: string,
    data: {
      doctorId: string;
      date: string;
      time: string;
      serviceId?: string;
      type?: VisitType;
    },
  ) {
    const slots = await this.bookingPublic.getAvailableSlots(data.date, data.doctorId);
    const slot = slots.slots.find((s) => s.time === data.time);
    if (!slot || slot.isFull) {
      throw new BadRequestException('هذا الموعد غير متاح');
    }

    let visitType = data.type || VisitType.new;
    let notes: string | undefined;

    if (data.serviceId) {
      const service = await this.prisma.serviceCatalog.findFirst({
        where: { id: data.serviceId, isActive: true, showInBooking: true },
      });
      if (!service) throw new BadRequestException('الخدمة غير متاحة');
      visitType = this.bookingPublic.mapServiceToVisitType(service.name, service.category);
      notes = service.name;
    }

    return this.appointments.create({
      patientId,
      doctorId: data.doctorId,
      date: data.date,
      time: data.time,
      type: visitType,
      notes,
      serviceId: data.serviceId,
      bookingSource: 'online',
      status: AppointmentStatus.confirmed,
      autoQueue: false,
    });
  }

  async cancelAppointment(patientId: string, appointmentId: string) {
    const apt = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, patientId },
    });
    if (!apt) throw new BadRequestException('الموعد غير موجود');
    return this.appointments.remove(appointmentId);
  }

  /** رفع صورة نتيجة تحليل من بوابة المريضة */
  async uploadLabResult(patientId: string, labId: string, file: Express.Multer.File) {
    const lab = await this.prisma.labTest.findFirst({
      where: { id: labId, patientId },
      include: { patient: { select: { name: true } } },
    });
    if (!lab) throw new NotFoundException('التحليل غير موجود');

    if (lab.status === LabStatus.completed) {
      throw new BadRequestException('هذا التحليل مكتمل بالفعل');
    }

    const uploaded = await this.files.upload(file, patientId, lab.visitId ?? undefined);

    const updated = await this.prisma.labTest.update({
      where: { id: labId },
      data: {
        attachment: uploaded.filePath,
        status: LabStatus.in_progress,
        results: {
          value: 'صورة مرفوعة من المريضة',
          notes: 'بانتظار مراجعة الطبيب',
        },
      },
      include: { patient: { select: { id: true, name: true, phone: true } } },
    });

    await this.notifyDoctorPatientUpload(
      patientId,
      lab.patient.name,
      'lab',
      lab.testName,
      labId,
    );

    return updated;
  }

  private labResults(obj: unknown): { value?: string; notes?: string } | null {
    if (!obj || typeof obj !== 'object') return null;
    return obj as { value?: string; notes?: string };
  }

  isPatientUploadedLab(lab: { results?: unknown }) {
    const r = this.labResults(lab.results);
    return Boolean(r?.value?.includes('مرفوعة من المريضة'));
  }

  async listMyUploads(patientId: string) {
    const [attachments, labs] = await Promise.all([
      this.prisma.attachment.findMany({
        where: {
          patientId,
          visitId: null,
          type: { in: [AttachmentType.sonar, AttachmentType.document, AttachmentType.image] },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.labTest.findMany({
        where: { patientId, attachment: { not: null } },
        orderBy: { requestedDate: 'desc' },
      }),
    ]);

    const items: {
      id: string;
      kind: 'lab' | 'sonar';
      title: string;
      filePath: string;
      createdAt: string;
      labId?: string;
      attachmentId?: string;
      mimeType?: string | null;
    }[] = [];

    for (const lab of labs) {
      if (!lab.attachment) continue;
      items.push({
        id: `lab-${lab.id}`,
        kind: 'lab',
        title: lab.testName,
        filePath: lab.attachment,
        createdAt: lab.requestedDate.toISOString(),
        labId: lab.id,
        mimeType: lab.attachment.toLowerCase().endsWith('.pdf')
          ? 'application/pdf'
          : 'image/jpeg',
      });
    }

    const labPaths = new Set(labs.map((l) => l.attachment).filter(Boolean));
    for (const att of attachments) {
      if (labPaths.has(att.filePath)) continue;
      items.push({
        id: `att-${att.id}`,
        kind: att.type === AttachmentType.sonar ? 'sonar' : 'sonar',
        title: att.fileName || (att.type === AttachmentType.sonar ? 'أشعة / سونار' : 'ملف طبي'),
        filePath: att.filePath,
        createdAt: att.createdAt.toISOString(),
        attachmentId: att.id,
        mimeType: att.mimeType,
      });
    }

    items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return items;
  }

  async deletePatientLabUpload(patientId: string, labId: string) {
    const lab = await this.prisma.labTest.findFirst({
      where: { id: labId, patientId },
    });
    if (!lab?.attachment) {
      throw new BadRequestException('لا يوجد ملف لحذفه');
    }

    const patientOriginated = this.isPatientUploadedLab(lab);
    const filePath = lab.attachment;
    await this.files.deleteAttachmentsByPath(patientId, filePath);

    if (patientOriginated) {
      await this.prisma.labTest.delete({ where: { id: labId } });
    } else {
      await this.prisma.labTest.update({
        where: { id: labId },
        data: {
          attachment: null,
          status: LabStatus.requested,
          results: Prisma.JsonNull,
        },
      });
    }

    this.filesGateway.emitPatientFilesUpdated(patientId);
    return { ok: true };
  }

  async deletePatientAttachment(patientId: string, attachmentId: string) {
    const att = await this.prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        patientId,
        visitId: null,
        type: { in: [AttachmentType.sonar, AttachmentType.document, AttachmentType.image] },
      },
    });
    if (!att) throw new NotFoundException('الملف غير موجود');

    await this.files.deleteAttachmentRecord(att.id, patientId);
    this.filesGateway.emitPatientFilesUpdated(patientId);
    return { ok: true };
  }

  async replacePatientLabUpload(
    patientId: string,
    labId: string,
    file: Express.Multer.File,
  ) {
    const lab = await this.prisma.labTest.findFirst({
      where: { id: labId, patientId },
      include: { patient: { select: { name: true } } },
    });
    if (!lab) throw new NotFoundException('التحليل غير موجود');
    if (lab.status === LabStatus.completed) {
      throw new BadRequestException('لا يمكن تغيير تحليل مكتمل');
    }

    const oldPath = lab.attachment;
    const uploaded = await this.files.upload(file, patientId, lab.visitId ?? undefined);
    if (oldPath) {
      await this.files.deleteAttachmentsByPath(patientId, oldPath);
    }

    const updated = await this.prisma.labTest.update({
      where: { id: labId },
      data: {
        attachment: uploaded.filePath,
        status: LabStatus.in_progress,
        results: {
          value: 'صورة مرفوعة من المريضة',
          notes: 'بانتظار مراجعة الطبيب',
        },
      },
    });

    await this.notifyDoctorPatientUpload(
      patientId,
      lab.patient.name,
      'lab',
      lab.testName,
      labId,
    );

    return updated;
  }

  async replacePatientAttachment(
    patientId: string,
    attachmentId: string,
    file: Express.Multer.File,
  ) {
    const att = await this.prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        patientId,
        visitId: null,
      },
      include: { patient: { select: { name: true } } },
    });
    if (!att) throw new NotFoundException('الملف غير موجود');

    const oldPath = att.filePath;
    const uploaded = await this.files.upload(
      file,
      patientId,
      undefined,
      att.type === AttachmentType.sonar ? AttachmentType.sonar : AttachmentType.document,
    );
    await this.files.deleteAttachmentRecord(att.id, patientId);
    if (oldPath !== uploaded.filePath) {
      this.files.removeFileAtPath(oldPath);
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { name: true },
    });
    if (patient) {
      await this.notifyDoctorPatientUpload(
        patientId,
        patient.name,
        'sonar',
        att.fileName,
      );
    }

    return uploaded;
  }
}
