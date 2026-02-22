import {
  Patient,
  Appointment,
  ClinicalVisit,
  Prescription,
  LabTest,
  Invoice,
  User,
  PregnancyProfile,
  PregnancyMilestone,
  MonthlyCareTask,
  PatientAccount,
  PatientRegistrationPayload,
} from '@/types';
import { UserRole, AppointmentStatus, VisitType, LabStatus } from '@/types';

// المستخدمين
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'د. محمد عبدالحكيم',
    email: 'doctor@clinic.com',
    phone: '01234567890',
    role: UserRole.DOCTOR,
    createdAt: '2023-01-01',
  },
  {
    id: '2',
    name: 'سارة أحمد',
    email: 'reception@clinic.com',
    phone: '01234567891',
    role: UserRole.RECEPTION,
    createdAt: '2023-01-02',
  },
  {
    id: '3',
    name: 'المشرف العام',
    email: 'admin@clinic.com',
    phone: '01234567892',
    role: UserRole.ADMIN,
    createdAt: '2023-01-01',
  },
];

// المرضى
export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'سارة أحمد',
    phone: '01012345678',
    email: 'sara@example.com',
    dateOfBirth: '1990-05-15',
    address: 'القاهرة، مصر',
    emergencyContact: {
      name: 'أحمد محمد',
      phone: '01012345679',
      relation: 'زوج',
    },
    medicalHistory: {
      previousSurgeries: ['عملية استئصال الزائدة'],
      allergies: ['البنسلين'],
      chronicDiseases: [],
      previousPregnancies: 2,
      previousDeliveries: 2,
    },
    isPregnant: true,
    pregnancyWeek: 24,
  currentPregnancyId: 'preg-1',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'فاطمة محمد',
    phone: '01012345680',
    email: 'fatima@example.com',
    dateOfBirth: '1985-08-20',
    address: 'الجيزة، مصر',
    emergencyContact: {
      name: 'محمد علي',
      phone: '01012345681',
      relation: 'زوج',
    },
    medicalHistory: {
      previousSurgeries: [],
      allergies: [],
      chronicDiseases: ['سكري'],
      previousPregnancies: 1,
      previousDeliveries: 1,
    },
    isPregnant: false,
    createdAt: '2023-02-01',
    updatedAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'مريم علي',
    phone: '01012345682',
    email: 'mariam@example.com',
    dateOfBirth: '1992-03-10',
    address: 'الإسكندرية، مصر',
    emergencyContact: {
      name: 'علي حسن',
      phone: '01012345683',
      relation: 'أخ',
    },
    medicalHistory: {
      previousSurgeries: [],
      allergies: ['الأسبرين'],
      chronicDiseases: [],
      previousPregnancies: 0,
      previousDeliveries: 0,
    },
    isPregnant: true,
    pregnancyWeek: 12,
  currentPregnancyId: 'preg-3',
    createdAt: '2023-03-01',
    updatedAt: '2024-01-18',
  },
  {
    id: '4',
    name: 'نورا حسن',
    phone: '01012345684',
    email: 'nora@example.com',
    dateOfBirth: '1988-11-25',
    address: 'القاهرة، مصر',
    emergencyContact: {
      name: 'حسن أحمد',
      phone: '01012345685',
      relation: 'زوج',
    },
    medicalHistory: {
      previousSurgeries: ['عملية قيصرية'],
      allergies: [],
      chronicDiseases: [],
      previousPregnancies: 3,
      previousDeliveries: 3,
    },
    isPregnant: false,
    createdAt: '2023-04-01',
    updatedAt: '2024-01-08',
  },
  {
    id: '5',
    name: 'ليلى محمود',
    phone: '01012345686',
    email: 'layla@example.com',
    dateOfBirth: '1995-07-05',
    address: 'الجيزة، مصر',
    emergencyContact: {
      name: 'محمود سعيد',
      phone: '01012345687',
      relation: 'زوج',
    },
    medicalHistory: {
      previousSurgeries: [],
      allergies: [],
      chronicDiseases: [],
      previousPregnancies: 0,
      previousDeliveries: 0,
    },
    isPregnant: true,
    pregnancyWeek: 32,
  currentPregnancyId: 'preg-5',
    createdAt: '2023-05-01',
    updatedAt: '2024-01-20',
  },
  {
    id: '6',
    name: 'هدى علي',
    phone: '01098765432',
    email: 'huda@example.com',
    dateOfBirth: '1993-09-12',
    address: 'القاهرة - التجمع',
    emergencyContact: {
      name: 'علي محمود',
      phone: '01098765431',
      relation: 'زوج',
    },
    medicalHistory: {
      previousSurgeries: [],
      allergies: [],
      chronicDiseases: [],
      previousPregnancies: 1,
      previousDeliveries: 1,
    },
    isPregnant: true,
    pregnancyWeek: 18,
  currentPregnancyId: 'preg-6',
    createdAt: '2023-06-01',
    updatedAt: '2024-01-21',
  },
  {
    id: '7',
    name: 'دعاء سامي',
    phone: '01110002233',
    email: 'doaa@example.com',
    dateOfBirth: '1991-02-18',
    address: 'طنطا، مصر',
    emergencyContact: {
      name: 'سامي طارق',
      phone: '01110002234',
      relation: 'زوج',
    },
    medicalHistory: {
      previousSurgeries: ['عملية لحمية الرحم'],
      allergies: ['الأسبرين'],
      chronicDiseases: ['ضغط'],
      previousPregnancies: 2,
      previousDeliveries: 1,
    },
    isPregnant: true,
    pregnancyWeek: 16,
  currentPregnancyId: 'preg-7',
    createdAt: '2023-07-15',
    updatedAt: '2024-01-12',
  },
  {
    id: '8',
    name: 'فرح حسين',
    phone: '01066554433',
    email: 'farah@example.com',
    dateOfBirth: '1998-04-30',
    address: 'الإسكندرية - سموحة',
    emergencyContact: {
      name: 'حسين مصطفى',
      phone: '01066554432',
      relation: 'أب',
    },
    medicalHistory: {
      previousSurgeries: [],
      allergies: [],
      chronicDiseases: [],
      previousPregnancies: 0,
      previousDeliveries: 0,
    },
    isPregnant: false,
    createdAt: '2023-09-20',
    updatedAt: '2024-01-14',
  },
];

const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

const OTP_VALIDITY_MINUTES = 5;

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000)
    .toString()
    .substring(0, 6);

const initialPatientAccounts: PatientAccount[] = [
  {
    id: 'acct-1',
    patientId: '1',
    name: 'سارة أحمد',
    phone: '01012345678',
    email: 'sara@example.com',
    status: 'active',
  },
  {
    id: 'acct-2',
    patientId: '5',
    name: 'ليلى محمود',
    phone: '01012345686',
    email: 'layla@example.com',
    status: 'active',
  },
  {
    id: 'acct-3',
    patientId: '6',
    name: 'هدى علي',
    phone: '01098765432',
    email: 'huda@example.com',
    status: 'active',
  },
];

let patientAccounts: PatientAccount[] = [...initialPatientAccounts];
let patientAccountCounter = patientAccounts.length;
let patientCounter = mockPatients.length;

// بيانات الحمل المرحلية
const basePregnancyTimeline: PregnancyMilestone[] = [
  {
    id: 'month-1',
    month: 1,
    weekStart: 1,
    weekEnd: 4,
    title: 'البداية والتكوين',
    fetalWeight: '< 0.1 جم',
    fetalLength: '0.2 سم',
    description: 'تنزرع البويضة المخصبة وتبدأ الخلايا في التمايز لتكوين الجنين والمشيمة.',
    highlights: ['انقسام سريع للخلايا', 'بداية تشكل المشيمة', 'هرمونات الحمل تبدأ بالارتفاع'],
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&w=600&q=80',
  },
  {
    id: 'month-2',
    month: 2,
    weekStart: 5,
    weekEnd: 8,
    title: 'نبض القلب الأول',
    fetalWeight: '1 جم',
    fetalLength: '1.6 سم',
    description: 'يتكون الأنبوب العصبي وتبدأ ملامح الوجه الصغيرة والذراعين في الظهور.',
    highlights: ['سماع نبضات القلب بالسونار', 'تكون الأطراف', 'ظهور الحبل السري'],
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&w=600&q=80',
  },
  {
    id: 'month-3',
    month: 3,
    weekStart: 9,
    weekEnd: 12,
    title: 'مرحلة الجنين الكاملة',
    fetalWeight: '14 جم',
    fetalLength: '5.5 سم',
    description: 'يكتمل تكوين الأعضاء الرئيسية، ويمكن تمييز الأصابع وتبدأ الحركات الخفيفة.',
    highlights: ['اكتمال الأعضاء الأساسية', 'بدء حركة بسيطة', 'نهاية الثلث الأول'],
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&w=600&q=80',
  },
  {
    id: 'month-4',
    month: 4,
    weekStart: 13,
    weekEnd: 16,
    title: 'نمو سريع وملامح واضحة',
    fetalWeight: '100 جم',
    fetalLength: '12 سم',
    description: 'يتطور الهيكل العظمي وتصبح ملامح الوجه أوضح ويمكن معرفة نوع الجنين غالباً.',
    highlights: ['بداية الإحساس بالحركة', 'تكامل الهيكل العظمي', 'تكون الحواجب والرموش'],
    image: 'https://images.unsplash.com/photo-1504151932400-72d4384f04b3?auto=format&w=600&q=80',
  },
  {
    id: 'month-5',
    month: 5,
    weekStart: 17,
    weekEnd: 20,
    title: 'حركات قوية وتفاعل مع الصوت',
    fetalWeight: '300 جم',
    fetalLength: '25 سم',
    description: 'تشعر الأم بحركات واضحة، ويتفاعل الجنين مع الأصوات والضوء.',
    highlights: ['تطور حاسة السمع', 'نمو الشعر الزغبي', 'تكوين بصمات الأصابع'],
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&w=600&q=80',
  },
  {
    id: 'month-6',
    month: 6,
    weekStart: 21,
    weekEnd: 24,
    title: 'ملامح مكتملة واستجابة للمس',
    fetalWeight: '600 جم',
    fetalLength: '30 سم',
    description: 'تكون البشرة مجعدة وتظهر جفون العين وتبدأ الرئة في تكوين الحويصلات الهوائية.',
    highlights: ['تدريب على التنفس', 'ردود فعل للضوء', 'نمو الدماغ بسرعة'],
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&w=600&q=80',
  },
  {
    id: 'month-7',
    month: 7,
    weekStart: 25,
    weekEnd: 28,
    title: 'الاستعداد للخروج',
    fetalWeight: '1 كجم',
    fetalLength: '36 سم',
    description: 'تكتمل حاسة السمع ويستجيب الجنين للأصوات الخارجية بشكل واضح.',
    highlights: ['استدارة الرأس للأسفل', 'فتح العينين', 'زيادة طبقة الدهون'],
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&w=600&q=80',
  },
  {
    id: 'month-8',
    month: 8,
    weekStart: 29,
    weekEnd: 32,
    title: 'زيادة الوزن والقوة',
    fetalWeight: '1.8 كجم',
    fetalLength: '40 سم',
    description: 'يزداد وزن الجنين بسرعة وتصبح الحركات أقوى مع Tight space.',
    highlights: ['تطور الجهاز المناعي', 'نضج الرئتين', 'تخزين الحديد والكالسيوم'],
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&w=600&q=80',
  },
  {
    id: 'month-9',
    month: 9,
    weekStart: 33,
    weekEnd: 40,
    title: 'اللمسات الأخيرة',
    fetalWeight: '2.8-3.5 كجم',
    fetalLength: '50 سم',
    description: 'يستعد الجنين للولادة، يكتمل نمو الرئتين ويأخذ وضعية الرأس للأسفل.',
    highlights: ['اكتساب دهون تحت الجلد', 'نضج الرئتين بالكامل', 'استقرار في الحوض'],
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&w=600&q=80',
  },
];

const pregnantPatientIds = mockPatients.filter((p) => p.isPregnant).map((p) => p.id);

const buildTimelineForPatient = (patientId: string): PregnancyMilestone[] => {
  const patientName = mockPatients.find((p) => p.id === patientId)?.name.split(' ')[0] || 'المريضة';
  return basePregnancyTimeline.map((stage) => ({
    ...stage,
    id: `${patientId}-${stage.id}`,
    description: `${stage.description} (${patientName})`,
  }));
};

export const mockPregnancyTimelines: Record<string, PregnancyMilestone[]> = pregnantPatientIds.reduce(
  (acc, patientId) => {
    acc[patientId] = buildTimelineForPatient(patientId);
    return acc;
  },
  {} as Record<string, PregnancyMilestone[]>
);

export const mockPregnancyProfiles: PregnancyProfile[] = [
  {
    pregnancyId: 'preg-1',
    patientId: '1',
    startDate: '2023-08-28',
    dueDate: '2024-06-10',
    currentWeek: 24,
    trimester: 2,
    riskLevel: 'low',
  },
  {
    pregnancyId: 'preg-3',
    patientId: '3',
    startDate: '2023-11-20',
    dueDate: '2024-08-30',
    currentWeek: 12,
    trimester: 1,
    riskLevel: 'low',
  },
  {
    pregnancyId: 'preg-5',
    patientId: '5',
    startDate: '2023-05-01',
    dueDate: '2024-02-20',
    currentWeek: 32,
    trimester: 3,
    riskLevel: 'medium',
  },
  {
    pregnancyId: 'preg-6',
    patientId: '6',
    startDate: '2023-09-15',
    dueDate: '2024-06-25',
    currentWeek: 18,
    trimester: 2,
    riskLevel: 'low',
  },
  {
    pregnancyId: 'preg-7',
    patientId: '7',
    startDate: '2023-10-05',
    dueDate: '2024-07-12',
    currentWeek: 16,
    trimester: 2,
    riskLevel: 'medium',
  },
];

export const mockMonthlyCarePlan: MonthlyCareTask[] = [
  {
    id: 'care-1',
    patientId: '1',
    month: 5,
    title: 'سونار تفصيلي للأسبوع 20',
    type: 'ultrasound',
    dueDate: '2024-02-05',
    status: 'scheduled',
    notes: 'التأكد من نمو الأعضاء وقياس عنق الرحم',
    location: 'غرفة السونار 2',
  },
  {
    id: 'care-2',
    patientId: '1',
    month: 6,
    title: 'تحليل سكر تراكمي',
    type: 'lab',
    dueDate: '2024-02-20',
    status: 'pending',
    notes: 'صيام 8 ساعات قبل التحليل',
  },
  {
    id: 'care-3',
    patientId: '1',
    month: 7,
    title: 'جرعة فيتامين د وريدي',
    type: 'injection',
    dueDate: '2024-03-10',
    status: 'scheduled',
    notes: 'بعد استشارة الطبيب',
  },
  {
    id: 'care-4',
    patientId: '1',
    month: 8,
    title: 'متابعة CTG',
    type: 'visit',
    dueDate: '2024-04-15',
    status: 'pending',
    notes: 'رصد نبض الجنين ساعة كاملة',
  },
  {
    id: 'care-5',
    patientId: '6',
    month: 5,
    title: 'سونار رباعي الأبعاد',
    type: 'ultrasound',
    dueDate: '2024-03-05',
    status: 'scheduled',
    notes: 'إحضار USB لحفظ الصور',
  },
  {
    id: 'care-6',
    patientId: '6',
    month: 6,
    title: 'تحليل وظائف كبد',
    type: 'lab',
    dueDate: '2024-03-20',
    status: 'pending',
  },
  {
    id: 'care-7',
    patientId: '6',
    month: 7,
    title: 'حقنة حديد',
    type: 'injection',
    dueDate: '2024-04-18',
    status: 'pending',
  },
  {
    id: 'care-8',
    patientId: '5',
    month: 8,
    title: 'زيارة تقييم الولادة',
    type: 'visit',
    dueDate: '2024-01-30',
    status: 'scheduled',
    notes: 'مراجعة خطة الولادة والولادة الطبيعية',
  },
  {
    id: 'care-9',
    patientId: '5',
    month: 9,
    title: 'مراقبة ضغط أسبوعية',
    type: 'visit',
    dueDate: '2024-02-10',
    status: 'pending',
  },
  {
    id: 'care-10',
    patientId: '7',
    month: 4,
    title: 'تحليل فيتامين ب12',
    type: 'lab',
    dueDate: '2024-02-12',
    status: 'completed',
    notes: 'تم قبل أسبوع',
  },
  {
    id: 'care-11',
    patientId: '7',
    month: 5,
    title: 'مكملات ضغط الدم',
    type: 'supplement',
    dueDate: '2024-02-28',
    status: 'scheduled',
  },
];

// المواعيد
export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    date: '2024-01-20',
    time: '09:00',
    status: AppointmentStatus.IN_PROGRESS,
    type: VisitType.PREGNANCY_CHECK,
    notes: 'متابعة حمل - أسبوع 24',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    patientId: '2',
    doctorId: '1',
    date: '2024-01-20',
    time: '09:30',
    status: AppointmentStatus.SCHEDULED,
    type: VisitType.NEW,
    notes: 'كشف جديد',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-16',
  },
  {
    id: '3',
    patientId: '3',
    doctorId: '1',
    date: '2024-01-20',
    time: '10:00',
    status: AppointmentStatus.CONFIRMED,
    type: VisitType.PREGNANCY_CHECK,
    notes: 'متابعة حمل - أسبوع 12',
    createdAt: '2024-01-17',
    updatedAt: '2024-01-19',
  },
  {
    id: '4',
    patientId: '4',
    doctorId: '1',
    date: '2024-01-20',
    time: '10:30',
    status: AppointmentStatus.SCHEDULED,
    type: VisitType.FOLLOW_UP,
    notes: 'متابعة',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18',
  },
  {
    id: '5',
    patientId: '5',
    doctorId: '1',
    date: '2024-01-20',
    time: '11:00',
    status: AppointmentStatus.CONFIRMED,
    type: VisitType.PREGNANCY_CHECK,
    notes: 'متابعة حمل - أسبوع 32',
    createdAt: '2024-01-19',
    updatedAt: '2024-01-19',
  },
  {
    id: '6',
    patientId: '1',
    doctorId: '1',
    date: '2024-01-21',
    time: '09:00',
    status: AppointmentStatus.SCHEDULED,
    type: VisitType.PREGNANCY_CHECK,
    notes: 'متابعة حمل',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
  {
    id: '7',
    patientId: '6',
    doctorId: '1',
    date: '2024-01-22',
    time: '12:00',
    status: AppointmentStatus.SCHEDULED,
    type: VisitType.PREGNANCY_CHECK,
    notes: 'حجز عبر بوابة المريضة',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
  {
    id: '8',
    patientId: '7',
    doctorId: '1',
    date: '2024-01-22',
    time: '12:30',
    status: AppointmentStatus.CONFIRMED,
    type: VisitType.PREGNANCY_CHECK,
    notes: 'متابعة حمل أسبوع 16',
    createdAt: '2024-01-21',
    updatedAt: '2024-01-21',
  },
  {
    id: '9',
    patientId: '8',
    doctorId: '1',
    date: '2024-01-22',
    time: '14:00',
    status: AppointmentStatus.SCHEDULED,
    type: VisitType.NEW,
    notes: 'كشف تأخر إنجاب',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-21',
  },
  {
    id: '10',
    patientId: '5',
    doctorId: '1',
    date: '2024-01-22',
    time: '15:00',
    status: AppointmentStatus.CONFIRMED,
    type: VisitType.PREGNANCY_CHECK,
    notes: 'سونار ومتابعة أسبوع 32',
    createdAt: '2024-01-21',
    updatedAt: '2024-01-21',
  },
];

// الزيارات السابقة
export const mockClinicalVisits: ClinicalVisit[] = [
  {
    id: '1',
    appointmentId: '1',
    patientId: '1',
    doctorId: '1',
    date: '2024-01-15',
    type: VisitType.PREGNANCY_CHECK,
    complaint: 'متابعة روتينية للحمل',
    examination: 'الضغط: 120/80، الوزن: 65 كجم، نبض الجنين: 140',
    diagnosis: 'حمل طبيعي',
    treatmentPlan: 'متابعة روتينية، فيتامينات',
    pregnancyNotes: {
      week: 24,
      weight: 65,
      bloodPressure: '120/80',
      fetalHeartRate: 140,
      notes: 'الحمل يسير بشكل طبيعي',
    },
    attachments: [],
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    appointmentId: '2',
    patientId: '2',
    doctorId: '1',
    date: '2024-01-10',
    type: VisitType.NEW,
    complaint: 'ألم في البطن',
    examination: 'فحص طبيعي',
    diagnosis: 'التهاب بسيط',
    treatmentPlan: 'مضاد حيوي',
    attachments: [],
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    appointmentId: '7',
    patientId: '6',
    doctorId: '1',
    date: '2023-12-20',
    type: VisitType.PREGNANCY_CHECK,
    complaint: 'غثيان صباحي',
    examination: 'العلامات الحيوية مستقرة',
    diagnosis: 'أعراض طبيعية للحمل',
    treatmentPlan: 'إرشادات غذائية وفيتامينات',
    createdAt: '2023-12-20',
  },
  {
    id: '4',
    appointmentId: '8',
    patientId: '7',
    doctorId: '1',
    date: '2024-01-12',
    type: VisitType.PREGNANCY_CHECK,
    complaint: 'متابعة شهرية',
    examination: 'الضغط 110/70، السكر طبيعي',
    diagnosis: 'حمل منخفض الخطورة',
    treatmentPlan: 'استمرار فيتامينات ومتابعة بعد أسبوعين',
    createdAt: '2024-01-12',
  },
  {
    id: '5',
    appointmentId: '9',
    patientId: '8',
    doctorId: '1',
    date: '2024-01-05',
    type: VisitType.NEW,
    complaint: 'تأخر حمل منذ عام',
    examination: 'فحص أولي جيد، تحتاج فحوصات إضافية',
    diagnosis: 'اشتباه تكيس مبايض',
    treatmentPlan: 'تحاليل هرمونات + متابعة بعد أسبوعين',
    createdAt: '2024-01-05',
  },
];

// الروشتات
export const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    visitId: '1',
    patientId: '1',
    doctorId: '1',
    medications: [
      {
        id: '1',
        name: 'فيتامين د',
        dosage: '1000 وحدة',
        frequency: 'مرة يومياً',
        duration: 'شهر',
        instructions: 'بعد الأكل',
      },
      {
        id: '2',
        name: 'حديد',
        dosage: '100 مجم',
        frequency: 'مرة يومياً',
        duration: 'شهر',
        instructions: 'على معدة فارغة',
      },
    ],
    notes: 'متابعة روتينية',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    visitId: '2',
    patientId: '2',
    doctorId: '1',
    medications: [
      {
        id: '3',
        name: 'أموكسيسيلين',
        dosage: '500 مجم',
        frequency: '3 مرات يومياً',
        duration: '7 أيام',
        instructions: 'بعد الأكل',
      },
    ],
    notes: '',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    visitId: '3',
    patientId: '6',
    doctorId: '1',
    medications: [
      {
        id: '4',
        name: 'حمض الفوليك',
        dosage: '400 ميكروجرام',
        frequency: 'مرة يومياً',
        duration: 'شهر',
      },
    ],
    notes: 'متابعة حمل',
    createdAt: '2024-01-05',
  },
  {
    id: '4',
    visitId: '4',
    patientId: '7',
    doctorId: '1',
    medications: [
      {
        id: '5',
        name: 'مكمل أوميغا 3',
        dosage: '1 كبسولة',
        frequency: 'مرة يومياً',
        duration: 'شهر',
      },
      {
        id: '6',
        name: 'فيتامين ب المركب',
        dosage: 'كبسولة',
        frequency: 'مرة يومياً',
        duration: 'شهر',
      },
    ],
    notes: 'متابعة حمل أسبوع 16',
    createdAt: '2024-01-12',
  },
  {
    id: '5',
    visitId: '5',
    patientId: '8',
    doctorId: '1',
    medications: [
      {
        id: '7',
        name: 'كلوميد',
        dosage: '50 مجم',
        frequency: 'مرة يومياً',
        duration: '5 أيام',
      },
    ],
    notes: 'تحفيز التبويض',
    createdAt: '2024-01-05',
  },
];

// التحاليل
export const mockLabTests: LabTest[] = [
  {
    id: '1',
    patientId: '1',
    visitId: '1',
    requestedBy: '1',
    testName: 'تحليل دم شامل',
    status: LabStatus.REQUESTED,
    requestedDate: '2024-01-15',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    patientId: '1',
    visitId: '1',
    requestedBy: '1',
    testName: 'سونار',
    status: LabStatus.COMPLETED,
    requestedDate: '2024-01-15',
    completedDate: '2024-01-16',
    results: {
      value: 'طبيعي',
      notes: 'الحمل يسير بشكل طبيعي، الجنين في وضعية صحيحة',
    },
    attachment: '/images/sonar-1.jpg',
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    patientId: '3',
    requestedBy: '1',
    testName: 'تحليل سكر',
    status: LabStatus.IN_PROGRESS,
    requestedDate: '2024-01-18',
    createdAt: '2024-01-18',
  },
  {
    id: '4',
    patientId: '6',
    visitId: '3',
    requestedBy: '1',
    testName: 'سونار متابعة',
    status: LabStatus.COMPLETED,
    requestedDate: '2024-01-05',
    completedDate: '2024-01-06',
    results: {
      value: 'الجنين بحالة ممتازة',
    },
    attachment: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    createdAt: '2024-01-05',
  },
  {
    id: '5',
    patientId: '7',
    visitId: '4',
    requestedBy: '1',
    testName: 'تحاليل دم كاملة',
    status: LabStatus.REQUESTED,
    requestedDate: '2024-01-12',
    createdAt: '2024-01-12',
  },
];

// الفواتير
export const mockInvoices: Invoice[] = [
  {
    id: '1',
    patientId: '1',
    visitId: '1',
    items: [
      { id: '1', description: 'كشف', quantity: 1, price: 200, total: 200 },
      { id: '2', description: 'سونار', quantity: 1, price: 300, total: 300 },
    ],
    total: 500,
    paid: 500,
    remaining: 0,
    status: 'paid',
    createdAt: '2024-01-15',
    createdBy: '2',
  },
  {
    id: '2',
    patientId: '2',
    visitId: '2',
    items: [
      { id: '3', description: 'كشف جديد', quantity: 1, price: 250, total: 250 },
    ],
    total: 250,
    paid: 100,
    remaining: 150,
    status: 'partial',
    createdAt: '2024-01-10',
    createdBy: '2',
  },
];

// دالة للحصول على مريضة حسب ID
export const getPatientById = (id: string): Patient | undefined => {
  return mockPatients.find((p) => p.id === id);
};

// دالة للحصول على مواعيد اليوم
export const getTodayAppointments = (): Appointment[] => {
  const today = new Date().toISOString().split('T')[0];
  return mockAppointments.filter((apt) => apt.date === today);
};

// دالة للحصول على المرضى المنتظرين
export const getWaitingPatients = (): Appointment[] => {
  return mockAppointments.filter(
    (apt) =>
      apt.status === AppointmentStatus.CONFIRMED ||
      apt.status === AppointmentStatus.IN_PROGRESS
  );
};

// دالة للحصول على التحاليل المعلقة
export const getPendingLabTests = (): LabTest[] => {
  return mockLabTests.filter(
    (test) => test.status === LabStatus.REQUESTED || test.status === LabStatus.IN_PROGRESS
  );
};

// دالة للحصول على مواعيد مريضة معينة
export const getPatientAppointments = (patientId: string): Appointment[] => {
  return mockAppointments.filter((apt) => apt.patientId === patientId);
};

// دالة للحصول على زيارات مريضة معينة
export const getPatientVisits = (patientId: string): ClinicalVisit[] => {
  return mockClinicalVisits.filter((visit) => visit.patientId === patientId);
};

const findAccountByPhone = (phone: string): PatientAccount | undefined => {
  const normalized = normalizePhone(phone);
  return patientAccounts.find((account) => normalizePhone(account.phone) === normalized);
};

const createPatientRecord = (payload: PatientRegistrationPayload): Patient => {
  patientCounter += 1;
  const iso = new Date().toISOString();
  const newPatient: Patient = {
    id: patientCounter.toString(),
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    dateOfBirth: '1990-01-01',
    address: payload.email ? 'لم يتم التحديد' : undefined,
    isPregnant: payload.isPregnant ?? false,
    pregnancyWeek: payload.pregnancyWeek,
    createdAt: iso,
    updatedAt: iso,
  };
  mockPatients.push(newPatient);
  return newPatient;
};

export const findPatientByPhone = (phone: string) => {
  const account = findAccountByPhone(phone);
  if (!account) return undefined;
  const patient = getPatientById(account.patientId);
  if (!patient) return undefined;
  return { patient, account };
};

export const registerPatient = (payload: PatientRegistrationPayload) => {
  let patient = mockPatients.find(
    (p) => normalizePhone(p.phone) === normalizePhone(payload.phone)
  );
  if (!patient) {
    patient = createPatientRecord(payload);
  }

  let account = findAccountByPhone(payload.phone);
  if (!account) {
    patientAccountCounter += 1;
    account = {
      id: `acct-${patientAccountCounter}`,
      patientId: patient.id,
      name: payload.name || patient.name,
      phone: payload.phone,
      email: payload.email || patient.email,
      status: 'pending',
    };
    patientAccounts.push(account);
  } else {
    account.name = payload.name || account.name;
    account.email = payload.email || account.email;
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000).toISOString();
  account.otp = otp;
  account.otpExpiresAt = expiresAt;

  return { account, patient, otp, expiresAt };
};

export const verifyPatientOtp = (phone: string, otp: string) => {
  const account = findAccountByPhone(phone);
  if (!account || !account.otp) {
    return { success: false as const, reason: 'not_found' as const };
  }
  if (account.otp !== otp) {
    return { success: false as const, reason: 'invalid_code' as const };
  }
  if (account.otpExpiresAt && new Date(account.otpExpiresAt).getTime() < Date.now()) {
    return { success: false as const, reason: 'expired' as const };
  }

  account.status = 'active';
  account.otp = undefined;
  account.otpExpiresAt = undefined;
  account.lastLoginAt = new Date().toISOString();
  const patient = getPatientById(account.patientId);

  return {
    success: true as const,
    account,
    patient,
  };
};

export const resendPatientOtp = (phone: string) => {
  const account = findAccountByPhone(phone);
  if (!account) return undefined;
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000).toISOString();
  account.otp = otp;
  account.otpExpiresAt = expiresAt;
  return { account, otp, expiresAt };
};

export const getPregnancyProfile = (patientId: string): PregnancyProfile | undefined => {
  return mockPregnancyProfiles.find((profile) => profile.patientId === patientId);
};

export const getPregnancyTimeline = (patientId: string): PregnancyMilestone[] => {
  if (mockPregnancyTimelines[patientId]) {
    return mockPregnancyTimelines[patientId];
  }
  return basePregnancyTimeline.map((stage) => ({
    ...stage,
    id: `${patientId}-${stage.id}`,
  }));
};

export const getMonthlyCarePlan = (patientId: string): MonthlyCareTask[] => {
  return mockMonthlyCarePlan
    .filter((task) => task.patientId === patientId)
    .sort((a, b) => {
      if (a.month === b.month) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return a.month - b.month;
    });
};

// إعدادات الحجز للموقع العام
export const clinicSlotsPerHour = 4;
export const clinicWorkingHours = {
  start: 9,
  end: 17,
};

export interface PatientService {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  type: VisitType;
}

export const patientServices: PatientService[] = [
  {
    id: 'service-consult',
    name: 'كشف عام',
    description: 'جلسة كشف كاملة مع الدكتور تشمل خطة علاجية.',
    duration: 30,
    price: 250,
    type: VisitType.NEW,
  },
  {
    id: 'service-follow',
    name: 'متابعة حمل',
    description: 'متابعة شهرية للحمل مع التحاليل الضرورية.',
    duration: 20,
    price: 300,
    type: VisitType.PREGNANCY_CHECK,
  },
  {
    id: 'service-sonar',
    name: 'سونار رباعي الأبعاد',
    description: 'جلسة سونار مع صور رقمية ومراجعة كاملة.',
    duration: 25,
    price: 400,
    type: VisitType.PREGNANCY_CHECK,
  },
  {
    id: 'service-online',
    name: 'استشارة فيديو',
    description: 'استشارة سريعة عن بعد لمراجعة التحاليل والنتائج.',
    duration: 20,
    price: 200,
    type: VisitType.FOLLOW_UP,
  },
  {
    id: 'service-post',
    name: 'متابعة بعد الولادة',
    description: 'جلسة تقييم ما بعد الولادة مع خطة تغذية وتمارين.',
    duration: 30,
    price: 280,
    type: VisitType.POST_DELIVERY,
  },
];

export const patientTestimonials = [
  {
    id: 't1',
    name: 'مها خالد',
    text: 'حجزت موعدي أونلاين ووصلني تذكير قبل الزيارة، تجربة ممتازة.',
  },
  {
    id: 't2',
    name: 'هند محمد',
    text: 'الدكتورة مبدعة وواجهة الموقع خلتني أتابع حملي بسهولة.',
  },
  {
    id: 't3',
    name: 'نرمين سمير',
    text: 'أقدر أطلع على الروشتات والنتائج من الموبايل في أي وقت.',
  },
];

export const patientFaqs = [
  {
    question: 'هل يمكنني إلغاء الحجز؟',
    answer: 'نعم، يمكنك الإلغاء أو إعادة الجدولة من لوحة التحكم قبل الموعد بـ 12 ساعة.',
  },
  {
    question: 'هل الحجز يتطلب دفع أونلاين؟',
    answer: 'لا، الدفع يتم في العيادة عند الوصول.',
  },
  {
    question: 'هل توجد تذكيرات بالموعد؟',
    answer: 'نعم، نرسل رسالة SMS قبل الموعد بـ24 ساعة و2 ساعة.',
  },
];

let appointmentCounter = mockAppointments.length;

export const getAvailableSlots = (date: string) => {
  const slots: { time: string; remaining: number; isFull: boolean }[] = [];
  for (let hour = clinicWorkingHours.start; hour < clinicWorkingHours.end; hour++) {
    const hourStr = `${hour.toString().padStart(2, '0')}:00`;
    const bookedCount = mockAppointments.filter(
      (apt) => apt.date === date && apt.time === hourStr
    ).length;
    const remaining = Math.max(clinicSlotsPerHour - bookedCount, 0);
    slots.push({
      time: hourStr,
      remaining,
      isFull: remaining === 0,
    });
  }
  return slots;
};

export interface PortalBookingPayload {
  patientId: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  type: VisitType;
}

export const createPortalAppointment = (payload: PortalBookingPayload): Appointment => {
  appointmentCounter += 1;
  const newAppointment: Appointment = {
    id: appointmentCounter.toString(),
    patientId: payload.patientId,
    doctorId: '1',
    date: payload.date,
    time: payload.time,
    status: AppointmentStatus.SCHEDULED,
    type: payload.type,
    notes: `حجز عبر الموقع - ${payload.serviceName}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockAppointments.push(newAppointment);
  return newAppointment;
};

export const updateAppointmentStatus = (
  appointmentId: string,
  status: AppointmentStatus
): Appointment | undefined => {
  const appointment = mockAppointments.find((apt) => apt.id === appointmentId);
  if (appointment) {
    appointment.status = status;
    appointment.updatedAt = new Date().toISOString();
  }
  return appointment;
};

export interface PatientCardData {
  id: string;
  name: string;
  fileNumber: string;
  pregnancyWeek?: number;
  nextAppointment?: {
    date: string;
    time: string;
    service: string;
  };
  status: 'waiting' | 'checked' | 'new';
  notes?: string;
}

export const patientCardsSample: PatientCardData[] = [
  {
    id: '1',
    name: 'سارة أحمد',
    fileNumber: 'CL-2024-001',
    pregnancyWeek: 24,
    nextAppointment: {
      date: '2024-01-22',
      time: '09:00',
      service: 'متابعة حمل',
    },
    status: 'waiting',
    notes: 'تحتاج فحص سونار إضافي',
  },
  {
    id: '2',
    name: 'دعاء سامي',
    fileNumber: 'CL-2024-014',
    pregnancyWeek: 16,
    nextAppointment: {
      date: '2024-01-22',
      time: '12:30',
      service: 'متابعة شهرية',
    },
    status: 'new',
    notes: 'متابعة ضغط الدم',
  },
  {
    id: '3',
    name: 'فرح حسين',
    fileNumber: 'CL-2024-020',
    status: 'waiting',
    nextAppointment: {
      date: '2024-01-22',
      time: '14:00',
      service: 'كشف تأخر إنجاب',
    },
    notes: 'تحاليل هرمونات قيد التنفيذ',
  },
];

