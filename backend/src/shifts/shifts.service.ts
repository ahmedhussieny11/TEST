import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  getOpenShift(userId: string) {
    return this.prisma.cashShift.findFirst({
      where: { userId, isOpen: true },
    });
  }

  async openShift(userId: string, openingBalance: number) {
    const existing = await this.getOpenShift(userId);
    if (existing) throw new BadRequestException('لديك وردية مفتوحة بالفعل');
    return this.prisma.cashShift.create({
      data: { userId, openingBalance, isOpen: true },
    });
  }

  async closeShift(
    shiftId: string,
    actualCash: number,
    notes?: string,
  ) {
    const shift = await this.prisma.cashShift.findUnique({
      where: { id: shiftId },
      include: { invoices: { include: { payments: true } } },
    });
    if (!shift || !shift.isOpen) throw new NotFoundException('الوردية غير موجودة أو مغلقة');

    const invoicePaid = shift.invoices.reduce((s, inv) => s + inv.paid, 0);
    const expectedCash = shift.openingBalance + invoicePaid;

    return this.prisma.cashShift.update({
      where: { id: shiftId },
      data: {
        isOpen: false,
        closedAt: new Date(),
        expectedCash,
        actualCash,
        closingBalance: actualCash,
        notes,
      },
    });
  }

  async dailyReport(shiftId: string) {
    const shift = await this.prisma.cashShift.findUnique({
      where: { id: shiftId },
      include: {
        invoices: { include: { items: true, patient: { select: { name: true } } } },
        user: { select: { name: true } },
      },
    });
    if (!shift) throw new NotFoundException();
    const totalRevenue = shift.invoices.reduce((s, i) => s + i.paid, 0);
    return { shift, totalRevenue, invoiceCount: shift.invoices.length };
  }
}
