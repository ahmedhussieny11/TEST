import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  normalizePhone(phone: string): string {
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('20') && digits.length >= 12) {
      digits = `0${digits.slice(2)}`;
    }
    return digits.trim();
  }

  /** رقم مصر للموبايل: 11 رقم تبدأ بـ 01 */
  assertValidEgyptMobile(phone: string) {
    const n = this.normalizePhone(phone);
    if (!/^01\d{9}$/.test(n)) {
      throw new BadRequestException(
        'رقم الهاتف غير صحيح — اكتبي 11 رقم مثل 01012345678',
      );
    }
    return n;
  }

  /** حساب بوابة المريضة — يُنشأ تلقائياً عند التسجيل أو الحجز */
  async ensurePatientAccount(patientId: string, phone: string) {
    const normalized = this.normalizePhone(phone);
    const existingByPhone = await this.prisma.patientAccount.findUnique({
      where: { phone: normalized },
    });
    if (existingByPhone) {
      if (existingByPhone.patientId !== patientId) {
        throw new BadRequestException('رقم الهاتف مرتبط بمريضة أخرى');
      }
      return existingByPhone;
    }

    const existingByPatient = await this.prisma.patientAccount.findUnique({
      where: { patientId },
    });
    if (existingByPatient) {
      if (existingByPatient.phone !== normalized) {
        return this.prisma.patientAccount.update({
          where: { patientId },
          data: { phone: normalized },
        });
      }
      return existingByPatient;
    }

    return this.prisma.patientAccount.create({
      data: { patientId, phone: normalized, status: 'active' },
    });
  }

  /** تسجيل سريع: اسم + موبايل — إنشاء أو تحديث + حساب للدخول */
  async findOrCreateQuick(name: string, phone: string) {
    const normalized = this.normalizePhone(phone);
    if (normalized.length < 8) {
      throw new BadRequestException('رقم الهاتف غير صالح');
    }

    let patient = await this.prisma.patient.findUnique({ where: { phone: normalized } });
    if (!patient) {
      patient = await this.prisma.patient.create({
        data: { name: name.trim(), phone: normalized },
      });
    } else if (name.trim()) {
      patient = await this.prisma.patient.update({
        where: { id: patient.id },
        data: { name: name.trim() },
      });
    }

    await this.ensurePatientAccount(patient.id, normalized);
    return patient;
  }

  findAll(search?: string) {
    return this.prisma.patient.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      include: { pregnancies: { where: { isActive: true }, take: 1 } },
    });
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: { pregnancies: { where: { isActive: true } } },
    });
    if (!patient) throw new NotFoundException('المريضة غير موجودة');
    return patient;
  }

  async create(dto: CreatePatientDto) {
    const phone = this.normalizePhone(dto.phone);
    const patient = await this.prisma.patient.create({
      data: {
        name: dto.name,
        phone,
        email: dto.email,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        address: dto.address,
        isPregnant: dto.isPregnant ?? false,
        pregnancyWeek: dto.pregnancyWeek,
        medicalHistory: (dto.medicalHistory as object) ?? undefined,
        emergencyContact: (dto.emergencyContact as object) ?? undefined,
      },
    });
    await this.ensurePatientAccount(patient.id, phone);
    return patient;
  }

  async update(id: string, dto: UpdatePatientDto) {
    await this.findOne(id);
    return this.prisma.patient.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        address: dto.address,
        isPregnant: dto.isPregnant,
        pregnancyWeek: dto.pregnancyWeek,
        medicalHistory: (dto.medicalHistory as object) ?? undefined,
        emergencyContact: (dto.emergencyContact as object) ?? undefined,
      },
    });
  }

  async getTimeline(id: string) {
    await this.findOne(id);
    const [visits, prescriptions, labTests, attachments] = await Promise.all([
      this.prisma.clinicalVisit.findMany({
        where: { patientId: id },
        orderBy: { date: 'desc' },
        include: { doctor: { select: { id: true, name: true } } },
      }),
      this.prisma.prescription.findMany({
        where: { patientId: id },
        orderBy: { createdAt: 'desc' },
        include: { doctor: { select: { id: true, name: true } } },
      }),
      this.prisma.labTest.findMany({
        where: { patientId: id },
        orderBy: { requestedDate: 'desc' },
      }),
      this.prisma.attachment.findMany({
        where: { patientId: id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const events = [
      ...visits.map((v) => ({
        type: 'visit' as const,
        date: v.date,
        data: v,
      })),
      ...prescriptions.map((p) => ({
        type: 'prescription' as const,
        date: p.createdAt,
        data: p,
      })),
      ...labTests.map((l) => ({
        type: 'lab' as const,
        date: l.requestedDate,
        data: l,
      })),
      ...attachments.map((a) => ({
        type: 'attachment' as const,
        date: a.createdAt,
        data: a,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { visits, prescriptions, labTests, attachments, timeline: events };
  }
}
