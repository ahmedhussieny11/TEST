import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AttachmentType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024;

@Injectable()
export class FilesService {
  private uploadDir: string;

  constructor(
    private prisma: PrismaService,
    config: ConfigService,
  ) {
    this.uploadDir = config.get('UPLOAD_DIR') || './uploads';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(
    file: Express.Multer.File,
    patientId: string,
    visitId?: string,
    type?: AttachmentType,
  ) {
    if (!file) throw new BadRequestException('لم يتم رفع ملف');
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('نوع الملف غير مدعوم');
    }
    if (file.size > MAX_SIZE) throw new BadRequestException('حجم الملف كبير جداً');

    const ext = path.extname(file.originalname) || '.bin';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const attachmentType =
      type ||
      (file.mimetype.startsWith('image/') ? AttachmentType.image : AttachmentType.document);

    return this.prisma.attachment.create({
      data: {
        patientId,
        visitId,
        type: attachmentType,
        fileName: file.originalname,
        filePath: `/uploads/${fileName}`,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  }

  findByPatient(patientId: string) {
    return this.prisma.attachment.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  resolveDiskPath(filePath: string): string {
    const fileName = path.basename(filePath);
    return path.join(this.uploadDir, fileName);
  }

  removeFileAtPath(filePath: string) {
    if (!filePath) return;
    const disk = this.resolveDiskPath(filePath);
    if (fs.existsSync(disk)) {
      fs.unlinkSync(disk);
    }
  }

  async deleteAttachmentRecord(attachmentId: string, patientId?: string) {
    const att = await this.prisma.attachment.findFirst({
      where: patientId ? { id: attachmentId, patientId } : { id: attachmentId },
    });
    if (!att) throw new NotFoundException('الملف غير موجود');
    this.removeFileAtPath(att.filePath);
    await this.prisma.attachment.delete({ where: { id: attachmentId } });
    return att;
  }

  async deleteAttachmentsByPath(patientId: string, filePath: string) {
    const list = await this.prisma.attachment.findMany({
      where: { patientId, filePath },
    });
    for (const att of list) {
      await this.prisma.attachment.delete({ where: { id: att.id } });
    }
    this.removeFileAtPath(filePath);
  }
}
