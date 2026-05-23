import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, QueueStatus } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

function isAppointmentToday(date: Date): boolean {
  return startOfDay(new Date(date)).getTime() === startOfDay(new Date()).getTime();
}
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class QueueService {
  constructor(
    private prisma: PrismaService,
    private billing: BillingService,
  ) {}

  /** إضافة مواعيد اليوم تلقائياً لصالة الانتظار إن لم تكن مسجّلة */
  async syncTodayAppointmentsToQueue() {
    const today = new Date();
    const appointments = await this.prisma.appointment.findMany({
      where: {
        date: { gte: startOfDay(today), lte: endOfDay(today) },
        status: { notIn: [AppointmentStatus.cancelled, AppointmentStatus.no_show] },
        queueEntry: null,
        OR: [
          { invoice: null },
          { invoice: { status: InvoiceStatus.paid } },
        ],
      },
    });

    for (const apt of appointments) {
      await this.prisma.queueEntry.create({
        data: {
          appointmentId: apt.id,
          status: QueueStatus.waiting_room,
        },
      });
    }
  }

  async ensureInQueue(appointmentId: string) {
    const apt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { queueEntry: true },
    });
    if (!apt) return null;
    if (apt.queueEntry) return apt.queueEntry;
    if (!isAppointmentToday(apt.date)) return null;

    await this.billing.assertAppointmentPaidForQueue(appointmentId);

    return this.prisma.queueEntry.create({
      data: {
        appointmentId: apt.id,
        status: QueueStatus.waiting_room,
      },
    });
  }

  async getTodayQueue() {
    await this.syncTodayAppointmentsToQueue();

    return this.prisma.queueEntry.findMany({
      where: {
        appointment: {
          date: { gte: startOfDay(new Date()), lte: endOfDay(new Date()) },
          status: { notIn: [AppointmentStatus.cancelled, AppointmentStatus.no_show] },
        },
      },
      include: {
        appointment: {
          include: {
            patient: { select: { id: true, name: true, phone: true, isPregnant: true } },
            doctor: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { checkedInAt: 'asc' },
    });
  }

  async checkIn(appointmentId: string) {
    const apt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { queueEntry: true },
    });
    if (!apt) throw new NotFoundException('الموعد غير موجود');
    if (apt.queueEntry) throw new BadRequestException('تم تسجيل الوصول مسبقاً');

    await this.billing.assertAppointmentPaidForQueue(appointmentId);

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.confirmed },
    });

    return this.prisma.queueEntry.create({
      data: { appointmentId, status: QueueStatus.waiting_room },
      include: {
        appointment: {
          include: { patient: true, doctor: { select: { id: true, name: true } } },
        },
      },
    });
  }

  async updateStatus(id: string, status: QueueStatus) {
    const entry = await this.prisma.queueEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException();

    const updated = await this.prisma.queueEntry.update({
      where: { id },
      data: { status },
      include: {
        appointment: {
          include: { patient: true, doctor: { select: { id: true, name: true } } },
        },
      },
    });

    if (status === QueueStatus.in_exam) {
      await this.prisma.appointment.update({
        where: { id: entry.appointmentId },
        data: { status: AppointmentStatus.in_progress },
      });
    }

    if (status === QueueStatus.done) {
      await this.prisma.appointment.update({
        where: { id: entry.appointmentId },
        data: { status: AppointmentStatus.completed },
      });
    }

    return updated;
  }

  /** متتبع الدور للمريضة — رقم الدور، من قبلها، وقت الانتظار المتوقع */
  async getPatientQueueStatus(patientId: string) {
    const MINUTES_PER_AHEAD = 15;

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const myEntry = await this.prisma.queueEntry.findFirst({
      where: {
        appointment: {
          patientId,
          date: { gte: todayStart, lte: todayEnd },
        },
      },
      include: {
        appointment: {
          select: { time: true, doctor: { select: { name: true } } },
        },
      },
    });

    if (!myEntry) {
      const todayApt = await this.prisma.appointment.findFirst({
        where: {
          patientId,
          date: { gte: todayStart, lte: todayEnd },
          status: { notIn: [AppointmentStatus.cancelled, AppointmentStatus.no_show] },
        },
        orderBy: { time: 'asc' },
      });

      if (!todayApt) {
        return {
          status: 'no_appointment' as const,
          message: 'لا يوجد موعد لك اليوم',
        };
      }

      return {
        status: 'not_in_queue' as const,
        message: 'لم تُسجّلي في الطابور بعد — عند الوصول ادفعي ثم سجّلي وصولك في الاستقبال',
        appointmentTime: todayApt.time,
      };
    }

    if (myEntry.status === QueueStatus.done) {
      return {
        status: 'done' as const,
        message: 'انتهى موعدك — شكراً لزيارتك',
      };
    }

    if (myEntry.status === QueueStatus.in_exam) {
      return {
        status: 'in_exam' as const,
        message: 'أنتِ داخل الكشف الآن — تفضّلي إلى غرفة الطبيب',
        queueNumber: null,
        aheadCount: 0,
        estimatedMinutes: 0,
        appointmentTime: myEntry.appointment.time,
        doctorName: myEntry.appointment.doctor?.name,
      };
    }

    const activeQueue = await this.prisma.queueEntry.findMany({
      where: {
        appointment: {
          date: { gte: todayStart, lte: todayEnd },
          status: { notIn: [AppointmentStatus.cancelled, AppointmentStatus.no_show] },
        },
        status: { in: [QueueStatus.waiting_room, QueueStatus.in_exam] },
      },
      orderBy: { checkedInAt: 'asc' },
    });

    const myIndex = activeQueue.findIndex((e) => e.id === myEntry.id);
    const queueNumber = myIndex + 1;
    const aheadCount = activeQueue
      .slice(0, myIndex)
      .filter((e) => e.status === QueueStatus.waiting_room || e.status === QueueStatus.in_exam)
      .length;

    const inExamAhead = activeQueue
      .slice(0, myIndex)
      .some((e) => e.status === QueueStatus.in_exam);

    const estimatedMinutes = Math.max(
      aheadCount * MINUTES_PER_AHEAD + (inExamAhead ? 8 : 0),
      aheadCount > 0 ? 10 : 5,
    );

    return {
      status: 'waiting' as const,
      queueNumber,
      aheadCount,
      estimatedMinutes,
      message: `أنتِ رقم ${queueNumber} — يوجد ${aheadCount} حالات قبلك — الوقت المتوقع لدخولك حوالي ${estimatedMinutes} دقيقة`,
      appointmentTime: myEntry.appointment.time,
      doctorName: myEntry.appointment.doctor?.name,
    };
  }
}
