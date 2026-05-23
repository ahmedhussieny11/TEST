import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto, CreateTemplateDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  findAll(patientId?: string) {
    return this.prisma.prescription.findMany({
      where: patientId ? { patientId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        doctor: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(id: string) {
    const rx = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { select: { id: true, name: true } },
        visit: true,
      },
    });
    if (!rx) throw new NotFoundException('الروشتة غير موجودة');
    return rx;
  }

  create(dto: CreatePrescriptionDto, userId: string) {
    const doctorId = dto.doctorId ?? userId;
    return this.prisma.prescription.create({
      data: {
        visitId: dto.visitId,
        patientId: dto.patientId,
        doctorId,
        medications: dto.medications as object,
        notes: dto.notes,
      },
      include: { patient: true, doctor: { select: { name: true } } },
    });
  }

  getTemplates(doctorId: string) {
    return this.prisma.prescriptionTemplate.findMany({
      where: { doctorId },
      orderBy: [{ pregnancyMonthMin: 'asc' }, { name: 'asc' }],
    });
  }

  getTemplatesForUser(userId: string, role: string, filterDoctorId?: string) {
    if (role === 'admin') {
      return this.prisma.prescriptionTemplate.findMany({
        where: filterDoctorId ? { doctorId: filterDoctorId } : undefined,
        orderBy: [{ pregnancyMonthMin: 'asc' }, { name: 'asc' }],
        include: { doctor: { select: { id: true, name: true } } },
      });
    }
    return this.getTemplates(userId);
  }

  getSuggestedTemplates(doctorId: string, pregnancyMonth?: number) {
    const where: Prisma.PrescriptionTemplateWhereInput = { doctorId };

    if (pregnancyMonth != null && pregnancyMonth >= 1 && pregnancyMonth <= 9) {
      where.OR = [
        { pregnancyMonthMin: null, pregnancyMonthMax: null },
        {
          AND: [
            {
              OR: [
                { pregnancyMonthMin: null },
                { pregnancyMonthMin: { lte: pregnancyMonth } },
              ],
            },
            {
              OR: [
                { pregnancyMonthMax: null },
                { pregnancyMonthMax: { gte: pregnancyMonth } },
              ],
            },
          ],
        },
      ];
    }

    return this.prisma.prescriptionTemplate.findMany({
      where,
      orderBy: [{ pregnancyMonthMin: 'asc' }, { name: 'asc' }],
    });
  }

  createTemplate(dto: CreateTemplateDto, userId: string, role: string) {
    const doctorId =
      role === 'admin' && dto.doctorId ? dto.doctorId : userId;
    return this.prisma.prescriptionTemplate.create({
      data: {
        name: dto.name,
        notes: dto.notes,
        medications: dto.medications as object,
        doctorId,
        pregnancyMonthMin: dto.pregnancyMonthMin ?? null,
        pregnancyMonthMax: dto.pregnancyMonthMax ?? null,
      },
    });
  }

  async updateTemplate(
    id: string,
    dto: CreateTemplateDto,
    userId: string,
    role: string,
  ) {
    const where =
      role === 'admin' ? { id } : { id, doctorId: userId };
    const t = await this.prisma.prescriptionTemplate.findFirst({ where });
    if (!t) throw new NotFoundException();
    return this.prisma.prescriptionTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        notes: dto.notes,
        medications: dto.medications as object,
        pregnancyMonthMin: dto.pregnancyMonthMin ?? null,
        pregnancyMonthMax: dto.pregnancyMonthMax ?? null,
      },
    });
  }

  async deleteTemplate(id: string, userId: string, role: string) {
    const where =
      role === 'admin'
        ? { id }
        : { id, doctorId: userId };
    const t = await this.prisma.prescriptionTemplate.findFirst({ where });
    if (!t) throw new NotFoundException();
    return this.prisma.prescriptionTemplate.delete({ where: { id } });
  }
}
