import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { addHours } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { FilesGateway } from '../files/files.gateway';
import { AttachmentType } from '@prisma/client';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class QuickCaptureService {
  constructor(
    private prisma: PrismaService,
    private files: FilesService,
    private filesGateway: FilesGateway,
  ) {}

  async createSession(data: {
    patientId: string;
    visitId?: string;
    createdById: string;
  }) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: data.patientId },
    });
    if (!patient) throw new NotFoundException('المريضة غير موجودة');

    let code = generateCode();
    for (let i = 0; i < 5; i++) {
      const exists = await this.prisma.quickCaptureSession.findUnique({ where: { code } });
      if (!exists) break;
      code = generateCode();
    }

    const session = await this.prisma.quickCaptureSession.create({
      data: {
        code,
        patientId: data.patientId,
        visitId: data.visitId,
        createdById: data.createdById,
        expiresAt: addHours(new Date(), 4),
      },
    });

    return { ...session, patientName: patient.name };
  }

  private async resolveSession(code: string) {
    const session = await this.prisma.quickCaptureSession.findUnique({
      where: { code },
    });
    if (!session) throw new NotFoundException('رمز غير صالح');
    if (session.expiresAt < new Date()) {
      throw new BadRequestException('انتهت صلاحية جلسة الرفع — أنشئي رمزاً جديداً من شاشة الكشف');
    }
    return session;
  }

  async getSessionInfo(code: string) {
    const session = await this.resolveSession(code);
    const patient = await this.prisma.patient.findUnique({
      where: { id: session.patientId },
      select: { name: true },
    });
    return {
      patientName: patient?.name ?? 'مريضة',
      expiresAt: session.expiresAt,
    };
  }

  async uploadViaSession(code: string, file: Express.Multer.File) {
    const session = await this.resolveSession(code);
    const attachment = await this.files.upload(
      file,
      session.patientId,
      session.visitId ?? undefined,
      AttachmentType.image,
    );
    this.filesGateway.emitPatientFilesUpdated(session.patientId);
    return attachment;
  }
}
