import { format } from 'date-fns';
import { Appointment, AppointmentStatus, Patient, VisitType } from '@/types';

/** توحيد تاريخ الموعد للمقارنة والعرض */
export function appointmentDateKey(date: string | Date): string {
  return format(new Date(date), 'yyyy-MM-dd');
}

export type ApiAppointment = Appointment & {
  patient?: {
    id: string;
    name: string;
    phone: string;
    isPregnant?: boolean;
    pregnancyWeek?: number;
  };
  doctor?: { id: string; name: string };
  invoice?: Appointment['invoice'];
  queueEntry?: Appointment['queueEntry'];
  service?: Appointment['service'];
  bookingSource?: string;
};

export function mapApiAppointment(raw: ApiAppointment): Appointment {
  return {
    id: raw.id,
    patientId: raw.patientId,
    patient: raw.patient
      ? ({
          id: raw.patient.id,
          name: raw.patient.name,
          phone: raw.patient.phone,
          isPregnant: raw.patient.isPregnant ?? false,
          pregnancyWeek: raw.patient.pregnancyWeek,
          dateOfBirth: '',
          createdAt: '',
          updatedAt: '',
        } as Patient)
      : undefined,
    doctorId: raw.doctorId,
    doctor: raw.doctor,
    date: appointmentDateKey(raw.date),
    time: raw.time,
    status: raw.status as AppointmentStatus,
    type: raw.type as VisitType,
    notes: raw.notes,
    serviceId: raw.serviceId,
    service: raw.service,
    bookingSource: raw.bookingSource,
    invoice: raw.invoice ?? null,
    queueEntry: raw.queueEntry ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function appointmentNeedsPayment(apt: Appointment): boolean {
  return !!apt.invoice && apt.invoice.status !== 'paid';
}

export function appointmentIsPaid(apt: Appointment): boolean {
  return !apt.invoice || apt.invoice.status === 'paid';
}
