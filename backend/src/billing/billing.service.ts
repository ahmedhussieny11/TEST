import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, AddPaymentDto } from './dto/create-invoice.dto';

const invoiceSummarySelect = {
  id: true,
  total: true,
  paid: true,
  remaining: true,
  status: true,
} as const;

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async resolveSystemBillingUserId(): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where: { role: { in: [UserRole.admin, UserRole.reception] } },
      orderBy: { createdAt: 'asc' },
    });
    if (!user) throw new BadRequestException('لا يوجد مستخدم للفوترة');
    return user.id;
  }

  getServices() {
    return this.prisma.serviceCatalog.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  findAllInvoices() {
    return this.prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        items: true,
        createdBy: { select: { id: true, name: true } },
        appointment: {
          select: { id: true, date: true, time: true, notes: true, status: true },
        },
      },
    });
  }

  async getInvoiceByAppointment(appointmentId: string) {
    return this.prisma.invoice.findUnique({
      where: { appointmentId },
      include: { items: true, payments: true, patient: true },
    });
  }

  async assertAppointmentPaidForQueue(appointmentId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { appointmentId },
    });
    if (invoice && invoice.status !== InvoiceStatus.paid) {
      throw new BadRequestException('يجب تحصيل المبلغ قبل تسجيل الوصول');
    }
  }

  async createPendingInvoiceForAppointment(params: {
    appointmentId: string;
    patientId: string;
    serviceId: string;
    createdById?: string;
  }) {
    const existing = await this.prisma.invoice.findUnique({
      where: { appointmentId: params.appointmentId },
    });
    if (existing) return existing;

    const service = await this.prisma.serviceCatalog.findUnique({
      where: { id: params.serviceId },
    });
    if (!service) throw new BadRequestException('الخدمة غير موجودة');

    const createdById =
      params.createdById ?? (await this.resolveSystemBillingUserId());

    return this.prisma.invoice.create({
      data: {
        patientId: params.patientId,
        appointmentId: params.appointmentId,
        total: service.price,
        paid: 0,
        remaining: service.price,
        status: InvoiceStatus.unpaid,
        createdById,
        items: {
          create: {
            description: service.name,
            quantity: 1,
            price: service.price,
            total: service.price,
          },
        },
      },
      include: { items: true, patient: true },
    });
  }

  async createInvoice(dto: CreateInvoiceDto, createdById: string, shiftId?: string) {
    const items = dto.items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      price: i.price,
      total: i.quantity * i.price,
    }));
    const total = items.reduce((s, i) => s + i.total, 0);
    const paid = dto.paidAmount ?? 0;
    const remaining = total - paid;
    const status =
      paid >= total ? InvoiceStatus.paid : paid > 0 ? InvoiceStatus.partial : InvoiceStatus.unpaid;

    const invoice = await this.prisma.invoice.create({
      data: {
        patientId: dto.patientId,
        visitId: dto.visitId,
        appointmentId: dto.appointmentId,
        total,
        paid,
        remaining,
        status,
        createdById,
        shiftId,
        items: { create: items },
      },
      include: { items: true, patient: true, appointment: true },
    });

    if (paid > 0) {
      await this.prisma.payment.create({
        data: { invoiceId: invoice.id, amount: paid, method: 'cash' },
      });
    }

    return invoice;
  }

  async addPayment(invoiceId: string, dto: AddPaymentDto) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('الفاتورة غير موجودة');

    const paid = invoice.paid + dto.amount;
    const remaining = Math.max(0, invoice.total - paid);
    const status =
      paid >= invoice.total
        ? InvoiceStatus.paid
        : paid > 0
          ? InvoiceStatus.partial
          : InvoiceStatus.unpaid;

    await this.prisma.payment.create({
      data: { invoiceId, amount: dto.amount, method: dto.method || 'cash' },
    });

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { paid, remaining, status },
      include: {
        items: true,
        payments: true,
        patient: true,
        appointment: { select: { id: true, date: true, time: true } },
      },
    });
  }

  async collectPayment(invoiceId: string, dto: AddPaymentDto, shiftId?: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('الفاتورة غير موجودة');

    const amount = dto.amount > 0 ? dto.amount : invoice.remaining;
    if (amount <= 0) throw new BadRequestException('الفاتورة مدفوعة بالفعل');

    const updated = await this.addPayment(invoiceId, {
      amount,
      method: dto.method || 'cash',
    });

    if (shiftId) {
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { shiftId },
      });
    }

    return updated;
  }
}

export { invoiceSummarySelect };
