import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const BOOKING_PRICE_MAP: { name: string; key: string }[] = [
  { name: 'كشف جديد', key: 'newVisit' },
  { name: 'متابعة', key: 'followUp' },
  { name: 'متابعة حمل', key: 'pregnancyCheck' },
  { name: 'سونار', key: 'sonar' },
];

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    const [settings, services] = await Promise.all([
      this.prisma.clinicSettings.findUnique({ where: { id: 'default' } }),
      this.prisma.serviceCatalog.findMany({
        where: { name: { not: 'عملية صغرى' } },
        orderBy: { price: 'asc' },
      }),
    ]);

    const base = settings ?? {
      id: 'default',
      clinicName: 'عيادة د. محمد عبدالحكيم',
      clinicTagline: 'طب النساء والتوليد',
      slotsPerHour: 4,
      workingHours: { start: '09:00', end: '17:00' },
      workingDays: [0, 1, 2, 3, 4, 6],
      prices: { newVisit: 300, followUp: 200, pregnancyCheck: 250, sonar: 400 },
    };

    return {
      ...base,
      bookingServices: services.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        showInBooking: s.showInBooking,
      })),
    };
  }

  async update(data: {
    clinicName?: string;
    clinicTagline?: string;
    slotsPerHour?: number;
    workingHours?: object;
    workingDays?: number[];
    prices?: object;
    bookingServices?: { id: string; price?: number; showInBooking?: boolean }[];
  }) {
    const result = await this.prisma.clinicSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        clinicName: data.clinicName ?? 'عيادة د. محمد عبدالحكيم',
        clinicTagline: data.clinicTagline ?? 'طب النساء والتوليد',
        slotsPerHour: data.slotsPerHour ?? 4,
        workingHours: data.workingHours ?? { start: '09:00', end: '17:00' },
        workingDays: data.workingDays ?? [0, 1, 2, 3, 4, 6],
        prices: data.prices ?? {
          newVisit: 300,
          followUp: 200,
          pregnancyCheck: 250,
          sonar: 400,
        },
      },
      update: {
        clinicName: data.clinicName,
        clinicTagline: data.clinicTagline,
        slotsPerHour: data.slotsPerHour,
        workingHours: data.workingHours,
        workingDays: data.workingDays,
        prices: data.prices,
      },
    });

    if (data.bookingServices?.length) {
      for (const item of data.bookingServices) {
        await this.prisma.serviceCatalog.update({
          where: { id: item.id },
          data: {
            ...(item.price != null ? { price: item.price } : {}),
            ...(item.showInBooking != null ? { showInBooking: item.showInBooking } : {}),
          },
        });
      }
    }

    const prices = data.prices as Record<string, number> | undefined;
    if (prices) {
      for (const item of BOOKING_PRICE_MAP) {
        if (prices[item.key] != null) {
          await this.prisma.serviceCatalog.updateMany({
            where: { name: item.name },
            data: { price: prices[item.key] },
          });
        }
      }
    }

    return this.get();
  }
}
