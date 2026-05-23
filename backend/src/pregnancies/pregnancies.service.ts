import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculatePregnancyFromLmp } from '../common/utils/pregnancy.util';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';

@Injectable()
export class PregnanciesService {
  constructor(private prisma: PrismaService) {}

  async findByPatient(patientId: string) {
    return this.prisma.pregnancy.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(patientId: string, dto: CreatePregnancyDto) {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('المريضة غير موجودة');

    const lmpDate = new Date(dto.lmpDate);
    const { dueDate, currentWeek, trimester } = calculatePregnancyFromLmp(lmpDate);

    await this.prisma.pregnancy.updateMany({
      where: { patientId, isActive: true },
      data: { isActive: false },
    });

    const pregnancy = await this.prisma.pregnancy.create({
      data: {
        patientId,
        lmpDate,
        dueDate,
        currentWeek,
        trimester,
        riskLevel: dto.riskLevel || 'low',
        isActive: true,
      },
    });

    await this.prisma.patient.update({
      where: { id: patientId },
      data: {
        isPregnant: true,
        pregnancyWeek: currentWeek,
        currentPregnancyId: pregnancy.id,
      },
    });

    return pregnancy;
  }

  async refreshWeeks(pregnancyId: string) {
    const pregnancy = await this.prisma.pregnancy.findUnique({ where: { id: pregnancyId } });
    if (!pregnancy) throw new NotFoundException();
    const { currentWeek, trimester, dueDate } = calculatePregnancyFromLmp(pregnancy.lmpDate);
    return this.prisma.pregnancy.update({
      where: { id: pregnancyId },
      data: { currentWeek, trimester, dueDate },
    });
  }
}
