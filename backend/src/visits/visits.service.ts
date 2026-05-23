import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  findAll(patientId?: string) {
    return this.prisma.clinicalVisit.findMany({
      where: patientId ? { patientId } : undefined,
      orderBy: { date: 'desc' },
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        doctor: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(id: string) {
    const visit = await this.prisma.clinicalVisit.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { select: { id: true, name: true } },
        prescriptions: true,
        attachments: true,
      },
    });
    if (!visit) throw new NotFoundException('الكشف غير موجود');
    return visit;
  }

  async create(dto: CreateVisitDto, userId: string) {
    const doctorId = dto.doctorId ?? userId;
    const data: Prisma.ClinicalVisitCreateInput = {
      patient: { connect: { id: dto.patientId } },
      doctor: { connect: { id: doctorId } },
      type: dto.type,
      complaint: dto.complaint,
      examination: dto.examination,
      diagnosis: dto.diagnosis,
      treatmentPlan: dto.treatmentPlan,
      pregnancyNotes: (dto.pregnancyNotes as object) ?? undefined,
    };

    if (dto.appointmentId) {
      data.appointment = { connect: { id: dto.appointmentId } };
      await this.prisma.appointment.update({
        where: { id: dto.appointmentId },
        data: { status: AppointmentStatus.completed },
      });
      const queue = await this.prisma.queueEntry.findUnique({
        where: { appointmentId: dto.appointmentId },
      });
      if (queue) {
        await this.prisma.queueEntry.update({
          where: { id: queue.id },
          data: { status: 'done' },
        });
      }
    }

    return this.prisma.clinicalVisit.create({
      data,
      include: { patient: true, doctor: { select: { id: true, name: true } } },
    });
  }
}
