// أنواع المستخدمين
export enum UserRole {
  DOCTOR = 'doctor',
  RECEPTION = 'reception',
  PATIENT = 'patient',
  ADMIN = 'admin',
}

// حالة الموعد
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

// نوع الكشف
export enum VisitType {
  NEW = 'new',
  FOLLOW_UP = 'follow_up',
  PREGNANCY_CHECK = 'pregnancy_check',
  POST_DELIVERY = 'post_delivery',
}

// حالة التحليل
export enum LabStatus {
  REQUESTED = 'requested',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

// المستخدم
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

// المريضة
export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  medicalHistory?: {
    previousSurgeries?: string[];
    allergies?: string[];
    chronicDiseases?: string[];
    previousPregnancies?: number;
    previousDeliveries?: number;
  };
  isPregnant: boolean;
  pregnancyWeek?: number;
  currentPregnancyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentInvoiceSummary {
  id: string;
  total: number;
  paid: number;
  remaining: number;
  status: 'paid' | 'partial' | 'unpaid';
}

// الموعد
export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  doctorId: string;
  doctor?: { id: string; name: string };
  date: string; // ISO date string
  time: string; // HH:mm format
  status: AppointmentStatus;
  type: VisitType;
  notes?: string;
  serviceId?: string;
  service?: { id: string; name: string; price: number };
  bookingSource?: string;
  invoice?: AppointmentInvoiceSummary | null;
  queueEntry?: { id: string; status: string } | null;
  createdAt: string;
  updatedAt: string;
}

// الكشف
export interface ClinicalVisit {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  date: string;
  type: VisitType;
  complaint?: string;
  examination?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  pregnancyNotes?: {
    week: number;
    weight?: number;
    bloodPressure?: string;
    fetalHeartRate?: number;
    notes?: string;
  };
  attachments?: {
    type: 'image' | 'document' | 'sonar';
    url: string;
    name: string;
  }[];
  createdAt: string;
}

// الروشتة
export interface Prescription {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  medications: Medication[];
  notes?: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// التحليل
export interface LabTest {
  id: string;
  patientId: string;
  visitId?: string;
  requestedBy: string;
  testName: string;
  status: LabStatus;
  requestedDate: string;
  completedDate?: string;
  results?: {
    value: string;
    unit?: string;
    normalRange?: string;
    notes?: string;
  };
  attachment?: string;
  createdAt: string;
}

// الفاتورة
export interface Invoice {
  id: string;
  patientId: string;
  patient?: { id: string; name: string; phone: string };
  visitId?: string;
  appointmentId?: string;
  appointment?: { id: string; date: string; time: string; notes?: string; status?: string };
  items: InvoiceItem[];
  total: number;
  paid: number;
  remaining: number;
  status: 'paid' | 'partial' | 'unpaid';
  createdAt: string;
  createdBy: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PregnancyProfile {
  pregnancyId: string;
  patientId: string;
  startDate: string;
  dueDate: string;
  currentWeek: number;
  trimester: 1 | 2 | 3;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PregnancyMilestone {
  id: string;
  month: number;
  weekStart: number;
  weekEnd: number;
  title: string;
  fetalWeight: string;
  fetalLength: string;
  description: string;
  highlights: string[];
  image?: string;
}

export type CareTaskType = 'visit' | 'ultrasound' | 'lab' | 'injection' | 'supplement';

export interface MonthlyCareTask {
  id: string;
  patientId: string;
  month: number;
  title: string;
  type: CareTaskType;
  dueDate: string;
  status: 'pending' | 'scheduled' | 'completed';
  notes?: string;
  location?: string;
}

export interface PatientAccount {
  id: string;
  patientId: string;
  name: string;
  phone: string;
  email?: string;
  status: 'pending' | 'active';
  otp?: string;
  otpExpiresAt?: string;
  lastLoginAt?: string;
}

export interface PatientRegistrationPayload {
  name: string;
  phone: string;
  email?: string;
  isPregnant?: boolean;
  pregnancyWeek?: number;
}

export interface BookingServiceSetting {
  id: string;
  name: string;
  price: number;
  showInBooking: boolean;
}

// إعدادات المواعيد
export interface AppointmentSettings {
  clinicName?: string;
  clinicTagline?: string | null;
  slotsPerHour: number;
  workingHours: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  workingDays: number[]; // 0 = Sunday, 6 = Saturday
  prices: {
    newVisit: number;
    followUp: number;
    pregnancyCheck: number;
    sonar: number;
  };
  bookingServices?: BookingServiceSetting[];
}

// Template للكشف
export interface VisitTemplate {
  id: string;
  name: string;
  type: VisitType;
  complaint?: string;
  examination?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  createdBy: string;
}

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
  status: 'waiting' | 'in_exam' | 'scheduled' | 'new' | 'checked';
  notes?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  todayAppointments: number;
  completedVisits: number;
  pendingLabs: number;
  activePregnancies: number;
  overdueFollowUps: number;
  monthlyRevenue: number;
  appointmentsByStatus: {
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

