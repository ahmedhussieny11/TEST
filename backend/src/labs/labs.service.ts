import { Injectable, NotFoundException } from '@nestjs/common';
import { LabStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabResultsDto } from './dto/update-lab-results.dto';

@Injectable()
export class LabsService {
  constructor(private prisma: PrismaService) {}

  findAll(status?: string, patientId?: string) {
    return this.prisma.labTest.findMany({
      where: {
        ...(status ? { status: status as LabStatus } : {}),
        ...(patientId ? { patientId } : {}),
      },
      orderBy: { requestedDate: 'desc' },
      include: { patient: { select: { id: true, name: true, phone: true } } },
    });
  }

  create(dto: CreateLabDto, requestedById: string) {
    return this.prisma.labTest.create({
      data: {
        patientId: dto.patientId,
        visitId: dto.visitId,
        testName: dto.testName,
        requestedById,
        status: LabStatus.requested,
      },
      include: { patient: { select: { id: true, name: true, phone: true } } },
    });
  }

  async updateResults(id: string, dto: UpdateLabResultsDto) {
    const lab = await this.prisma.labTest.findUnique({ where: { id } });
    if (!lab) throw new NotFoundException('التحليل غير موجود');

    const status = dto.status ?? LabStatus.completed;
    return this.prisma.labTest.update({
      where: { id },
      data: {
        status,
        completedDate: status === LabStatus.completed ? new Date() : lab.completedDate,
        results: {
          value: dto.value,
          unit: dto.unit,
          normalRange: dto.normalRange,
          notes: dto.notes,
        },
      },
      include: { patient: { select: { id: true, name: true, phone: true } } },
    });
  }
}
