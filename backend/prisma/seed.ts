import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // إزالة بيانات العرض القديمة من seed السابق
  const legacyIds = [
    'seed-apt-1',
    'seed-visit-1',
    'seed-rx-1',
    'seed-lab-1',
    'seed-inv-1',
    'seed-pregnancy-1',
  ];
  await prisma.queueEntry.deleteMany({ where: { appointmentId: 'seed-apt-1' } });
  await prisma.invoice.deleteMany({ where: { id: { in: ['seed-inv-1'] } } });
  await prisma.prescription.deleteMany({ where: { id: { in: ['seed-rx-1'] } } });
  await prisma.labTest.deleteMany({ where: { id: { in: ['seed-lab-1'] } } });
  await prisma.clinicalVisit.deleteMany({ where: { id: { in: ['seed-visit-1'] } } });
  await prisma.appointment.deleteMany({ where: { id: { in: ['seed-apt-1'] } } });
  await prisma.pregnancy.deleteMany({ where: { id: { in: ['seed-pregnancy-1'] } } });
  void legacyIds;

  const passwordHash = await bcrypt.hash('clinic123', 10);

  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@clinic.com' },
    update: { passwordHash, name: 'د. محمد عبدالحكيم' },
    create: {
      name: 'د. محمد عبدالحكيم',
      email: 'doctor@clinic.com',
      phone: '01000000001',
      passwordHash,
      role: UserRole.doctor,
    },
  });

  await prisma.user.upsert({
    where: { email: 'reception@clinic.com' },
    update: { passwordHash, name: 'سارة الاستقبال' },
    create: {
      name: 'سارة الاستقبال',
      email: 'reception@clinic.com',
      phone: '01000000002',
      passwordHash,
      role: UserRole.reception,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@clinic.com' },
    update: { passwordHash, name: 'مشرف النظام' },
    create: {
      name: 'مشرف النظام',
      email: 'admin@clinic.com',
      phone: '01000000003',
      passwordHash,
      role: UserRole.admin,
    },
  });

  await prisma.clinicSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      clinicName: 'عيادة د. محمد عبدالحكيم',
      clinicTagline: 'طب النساء والتوليد',
      slotsPerHour: 4,
      workingHours: { start: '09:00', end: '17:00' },
      workingDays: [0, 1, 2, 3, 4, 6],
      prices: { newVisit: 300, followUp: 200, pregnancyCheck: 250, sonar: 400 },
    },
  });

  const services = [
    { name: 'كشف جديد', price: 300, category: 'visit', showInBooking: true },
    { name: 'متابعة', price: 200, category: 'visit', showInBooking: true },
    { name: 'متابعة حمل', price: 250, category: 'visit', showInBooking: true },
    { name: 'سونار', price: 400, category: 'procedure', showInBooking: true },
  ];
  for (const s of services) {
    const existing = await prisma.serviceCatalog.findFirst({ where: { name: s.name } });
    if (existing) {
      await prisma.serviceCatalog.update({
        where: { id: existing.id },
        data: { price: s.price, showInBooking: s.showInBooking, isActive: true },
      });
    } else {
      await prisma.serviceCatalog.create({ data: s });
    }
  }
  await prisma.serviceCatalog.deleteMany({ where: { name: 'عملية صغرى' } });

  const rxTemplates: {
    name: string;
    pregnancyMonthMin: number | null;
    pregnancyMonthMax: number | null;
    medications: object[];
    notes?: string;
  }[] = [
    {
      name: 'الثلث الأول — أشهر 1–3',
      pregnancyMonthMin: 1,
      pregnancyMonthMax: 3,
      medications: [
        { name: 'حمض الفوليك', dosage: '5mg', frequency: 'يومياً', duration: '3 أشهر' },
        { name: 'فيتامينات حمل', dosage: 'قرص', frequency: 'يومياً', duration: '3 أشهر' },
      ],
      notes: 'مكملات أساسية بداية الحمل',
    },
    {
      name: 'الشهر 4 — منتصف الحمل',
      pregnancyMonthMin: 4,
      pregnancyMonthMax: 4,
      medications: [
        { name: 'حديد', dosage: 'قرص', frequency: 'يومياً', duration: 'شهر' },
        { name: 'كالسيوم', dosage: 'قرص', frequency: 'يومياً', duration: 'شهر' },
      ],
    },
    {
      name: 'الشهر 5–6',
      pregnancyMonthMin: 5,
      pregnancyMonthMax: 6,
      medications: [
        { name: 'حديد', dosage: 'قرص', frequency: 'يومياً', duration: 'شهرين' },
        { name: 'أوميغا 3', dosage: 'كبسولة', frequency: 'يومياً', duration: 'شهرين' },
      ],
    },
    {
      name: 'الشهر 7–9 — الأشهر الأخيرة',
      pregnancyMonthMin: 7,
      pregnancyMonthMax: 9,
      medications: [
        { name: 'حديد', dosage: 'قرص', frequency: 'يومياً', duration: 'حتى الولادة' },
        { name: 'كالسيوم + فيتامين د', dosage: 'قرص', frequency: 'يومياً', duration: 'حتى الولادة' },
      ],
      notes: 'متابعة الأنيميا والكالسيوم',
    },
    {
      name: 'روشتة عامة (كل الأشهر)',
      pregnancyMonthMin: null,
      pregnancyMonthMax: null,
      medications: [
        { name: 'مسكن آمن', dosage: 'حسب الحاجة', frequency: 'عند اللزوم', duration: '3 أيام' },
      ],
    },
  ];

  for (const tpl of rxTemplates) {
    const existing = await prisma.prescriptionTemplate.findFirst({
      where: { doctorId: doctor.id, name: tpl.name },
    });
    if (existing) {
      await prisma.prescriptionTemplate.update({
        where: { id: existing.id },
        data: {
          medications: tpl.medications,
          notes: tpl.notes,
          pregnancyMonthMin: tpl.pregnancyMonthMin,
          pregnancyMonthMax: tpl.pregnancyMonthMax,
        },
      });
    } else {
      await prisma.prescriptionTemplate.create({
        data: {
          doctorId: doctor.id,
          name: tpl.name,
          medications: tpl.medications,
          notes: tpl.notes,
          pregnancyMonthMin: tpl.pregnancyMonthMin,
          pregnancyMonthMax: tpl.pregnancyMonthMax,
        },
      });
    }
  }

  console.log('Seed completed. Password: clinic123');
  console.log('Staff only (no demo patients): doctor@clinic.com | reception@clinic.com | admin@clinic.com');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
