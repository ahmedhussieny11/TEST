import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { BillingService, invoiceSummarySelect } from '../billing/billing.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/create-appointment.dto';

const appointmentInclude = {
  patient: { select: { id: true, name: true, phone: true, isPregnant: true } },
  doctor: { select: { id: true, name: true } },
  queueEntry: true,
  invoice: { select: invoiceSummarySelect },
  service: { select: { id: true, name: true, price: true } },
} as const;

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
    private billing: BillingService,
  ) {}

  async findAll(from?: string, to?: string, doctorId?: string) {
    const where: Prisma.AppointmentWhereInput = {};
    if (from && to) {
      where.date = {
        gte: startOfDay(new Date(from)),
        lte: endOfDay(new Date(to)),
      };
    }
    if (doctorId) where.doctorId = doctorId;

    return this.prisma.appointment.findMany({
      where,
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      include: appointmentInclude,
    });
  }

  async getToday() {
    const today = new Date();
    return this.findAll(today.toISOString(), today.toISOString());
  }

  async findOne(id: string) {
    const apt = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { select: { id: true, name: true } },
        queueEntry: true,
        invoice: { select: invoiceSummarySelect },
        service: { select: { id: true, name: true, price: true } },
      },
    });
    if (!apt) throw new NotFoundException('الموعد غير موجود');
    return apt;
  }

  private async getSlotsPerHour(): Promise<number> {
    const settings = await this.prisma.clinicSettings.findUnique({
      where: { id: 'default' },
    });
    return settings?.slotsPerHour ?? 4;
  }

  private async assertSlotAvailable(
    doctorId: string,
    date: Date,
    time: string,
    excludeId?: string,
  ) {
    const slotsPerHour = await this.getSlotsPerHour();
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const bookedCount = await this.prisma.appointment.count({
      where: {
        doctorId,
        date: { gte: dayStart, lte: dayEnd },
        time,
        status: { notIn: [AppointmentStatus.cancelled, AppointmentStatus.no_show] },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (bookedCount >= slotsPerHour) {
      throw new BadRequestException('هذا الموعد ممتلئ — لا توجد أماكن متاحة');
    }
  }

  async create(dto: CreateAppointmentDto) {
    const date = startOfDay(new Date(dto.date));
    await this.assertSlotAvailable(dto.doctorId, date, dto.time);

    const status = dto.status ?? AppointmentStatus.scheduled;
    const bookingSource = dto.bookingSource ?? 'reception';
    const shouldAutoQueue = dto.autoQueue !== false && !dto.serviceId;

    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        date,
        time: dto.time,
        type: dto.type,
        notes: dto.notes,
        status,
        serviceId: dto.serviceId,
        bookingSource,
      },
      include: appointmentInclude,
    });

    if (dto.serviceId) {
      await this.billing.createPendingInvoiceForAppointment({
        appointmentId: appointment.id,
        patientId: dto.patientId,
        serviceId: dto.serviceId,
      });
    }

    if (shouldAutoQueue) {
      await this.queue.ensureInQueue(appointment.id);
    }

    return this.findOne(appointment.id);
  }

  async confirm(id: string) {
    const apt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!apt) throw new NotFoundException('الموعد غير موجود');
    if (apt.status === AppointmentStatus.cancelled) {
      throw new BadRequestException('لا يمكن تأكيد موعد ملغي');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.confirmed },
      include: appointmentInclude,
    });
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const apt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!apt) throw new NotFoundException('الموعد غير موجود');

    const date = dto.date ? startOfDay(new Date(dto.date)) : apt.date;
    const time = dto.time ?? apt.time;
    if (dto.date || dto.time) {
      await this.assertSlotAvailable(apt.doctorId, date, time, id);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        date: dto.date ? date : undefined,
        time: dto.time,
        notes: dto.notes,
        status: dto.status as AppointmentStatus | undefined,
      },
      include: appointmentInclude,
    });
  }

  async remove(id: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.cancelled },
      include: appointmentInclude,
    });
  }
}
