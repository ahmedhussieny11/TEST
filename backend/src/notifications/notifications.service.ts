import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    type: string;
    title: string;
    body?: string;
    link?: string;
    patientId?: string;
    labTestId?: string;
  }) {
    return this.prisma.clinicNotification.create({ data });
  }

  findUnread(limit = 20) {
    return this.prisma.clinicNotification.findMany({
      where: { read: false },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  findRecent(limit = 30) {
    return this.prisma.clinicNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  countUnread() {
    return this.prisma.clinicNotification.count({ where: { read: false } });
  }

  async markRead(id: string) {
    const n = await this.prisma.clinicNotification.findUnique({ where: { id } });
    if (!n) throw new NotFoundException();
    return this.prisma.clinicNotification.update({
      where: { id },
      data: { read: true },
    });
  }

  markAllRead() {
    return this.prisma.clinicNotification.updateMany({
      where: { read: false },
      data: { read: true },
    });
  }
}
