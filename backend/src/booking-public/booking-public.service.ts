import { BadRequestException, Injectable } from '@nestjs/common';
import { AppointmentStatus, VisitType } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { PatientsService } from '../patients/patients.service';

type WorkingHours = { start: string; end: string };

@Injectable()
export class BookingPublicService {
  constructor(
    private prisma: PrismaService,
    private appointments: AppointmentsService,
    private patients: PatientsService,
  ) {}

  async getConfig() {
    const [settings, services, doctors] = await Promise.all([
      this.prisma.clinicSettings.findUnique({ where: { id: 'default' } }),
      this.prisma.serviceCatalog.findMany({
        where: { isActive: true, showInBooking: true },
        orderBy: { price: 'asc' },
      }),
      this.prisma.user.findMany({
        where: { role: 'doctor' },
        select: { id: true, name: true },
      }),
    ]);

    return {
      branding: {
        name: settings?.clinicName ?? 'عيادة د. محمد عبدالحكيم',
        tagline: settings?.clinicTagline ?? 'طب النساء والتوليد',
      },
      settings: settings ?? {
        slotsPerHour: 4,
        workingHours: { start: '09:00', end: '17:00' },
        workingDays: [0, 1, 2, 3, 4, 6],
        prices: {},
      },
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description ?? '',
        price: s.price,
        category: s.category,
        visitType: this.mapServiceToVisitType(s.name, s.category),
      })),
      doctors,
    };
  }

  mapServiceToVisitType(name: string, category: string): VisitType {
    const n = name.toLowerCase();
    if (n.includes('سونار')) return VisitType.pregnancy_check;
    if (n.includes('حمل')) return VisitType.pregnancy_check;
    if (n.includes('ولادة')) return VisitType.post_delivery;
    if (n.includes('متابعة') && !n.includes('حمل')) return VisitType.follow_up;
    return VisitType.new;
  }

  async getAvailableSlots(dateStr: string, doctorId?: string) {
    const settings = await this.prisma.clinicSettings.findUnique({
      where: { id: 'default' },
    });
    const slotsPerHour = settings?.slotsPerHour ?? 4;
    const workingHours = (settings?.workingHours as WorkingHours) ?? {
      start: '09:00',
      end: '17:00',
    };
    const workingDays = (settings?.workingDays as number[]) ?? [0, 1, 2, 3, 4, 6];

    const date = startOfDay(new Date(dateStr));
    const dayOfWeek = date.getDay();
    if (!workingDays.includes(dayOfWeek)) {
      return { slots: [] as { time: string; remaining: number; isFull: boolean }[], slotsPerHour, doctorId: '' };
    }

    const doctor =
      doctorId
        ? await this.prisma.user.findUnique({ where: { id: doctorId } })
        : await this.prisma.user.findFirst({ where: { role: 'doctor' } });

    if (!doctor) {
      return { slots: [] as { time: string; remaining: number; isFull: boolean }[], slotsPerHour, doctorId: '' };
    }

    const [startH] = workingHours.start.split(':').map(Number);
    const [endH] = workingHours.end.split(':').map(Number);

    const dayAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        date: { gte: date, lte: endOfDay(date) },
        status: { notIn: [AppointmentStatus.cancelled, AppointmentStatus.no_show] },
      },
    });

    const slots: { time: string; remaining: number; isFull: boolean }[] = [];
    for (let hour = startH; hour < endH; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const booked = dayAppointments.filter((a) => a.time === time).length;
      const remaining = Math.max(slotsPerHour - booked, 0);
      slots.push({ time, remaining, isFull: remaining === 0 });
    }

    return { slots, slotsPerHour, doctorId: doctor.id };
  }

  async guestBook(dto: {
    name: string;
    phone: string;
    email?: string;
    serviceId: string;
    date: string;
    time: string;
    doctorId?: string;
  }) {
    if (!dto.name?.trim() || !dto.phone?.trim()) {
      throw new BadRequestException('الاسم ورقم الهاتف مطلوبان');
    }

    const service = await this.prisma.serviceCatalog.findFirst({
      where: { id: dto.serviceId, isActive: true, showInBooking: true },
    });
    if (!service) throw new BadRequestException('الخدمة غير متاحة');

    const slots = await this.getAvailableSlots(dto.date, dto.doctorId);
    const slot = slots.slots.find((s) => s.time === dto.time);
    if (!slot || slot.isFull) {
      throw new BadRequestException('هذا الموعد غير متاح');
    }

    let patient = await this.patients.findOrCreateQuick(dto.name, dto.phone);
    if (dto.email?.trim()) {
      patient = await this.prisma.patient.update({
        where: { id: patient.id },
        data: { email: dto.email.trim() },
      });
    }

    const doctorId = dto.doctorId ?? slots.doctorId;
    if (!doctorId) throw new BadRequestException('لا يوجد طبيب متاح');

    const visitType = this.mapServiceToVisitType(service.name, service.category);

    return this.appointments.create({
      patientId: patient.id,
      doctorId,
      date: dto.date,
      time: dto.time,
      type: visitType,
      notes: service.name,
      serviceId: dto.serviceId,
      bookingSource: 'online',
      status: AppointmentStatus.confirmed,
      autoQueue: false,
    });
  }
}
