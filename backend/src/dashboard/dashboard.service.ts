import { Injectable } from '@nestjs/common';
import { AppointmentStatus, LabStatus } from '@prisma/client';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const [
      todayAppointments,
      completedVisits,
      pendingLabs,
      activePregnancies,
      monthlyRevenue,
      appointmentsByStatus,
    ] = await Promise.all([
      this.prisma.appointment.count({
        where: { date: { gte: dayStart, lte: dayEnd }, status: { not: AppointmentStatus.cancelled } },
      }),
      this.prisma.clinicalVisit.count({
        where: { date: { gte: dayStart, lte: dayEnd } },
      }),
      this.prisma.labTest.count({ where: { status: { not: LabStatus.completed } } }),
      this.prisma.patient.count({ where: { isPregnant: true } }),
      this.prisma.invoice.aggregate({
        where: { createdAt: { gte: monthStart, lte: monthEnd } },
        _sum: { paid: true },
      }),
      this.prisma.appointment.groupBy({
        by: ['status'],
        where: { date: { gte: dayStart, lte: dayEnd } },
        _count: true,
      }),
    ]);

    const statusMap = {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      in_progress: 0,
      no_show: 0,
    };
    appointmentsByStatus.forEach((row) => {
      statusMap[row.status] = row._count;
    });

    const overdueFollowUps = await this.prisma.appointment.count({
      where: {
        status: AppointmentStatus.scheduled,
        date: { lt: dayStart },
      },
    });

    return {
      todayAppointments,
      completedVisits,
      pendingLabs,
      activePregnancies,
      overdueFollowUps,
      monthlyRevenue: monthlyRevenue._sum.paid ?? 0,
      appointmentsByStatus: statusMap,
    };
  }
}
