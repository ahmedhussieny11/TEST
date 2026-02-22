import { create } from 'zustand';
import { Appointment, AppointmentStatus } from '@/types';
import {
  createPortalAppointment,
  getPatientAppointments,
  updateAppointmentStatus,
  PortalBookingPayload,
} from '@/data/mockData';

interface PatientDataState {
  patientId: string | null;
  appointments: Appointment[];
  setPatientId: (patientId: string) => void;
  refreshAppointments: () => void;
  bookAppointment: (payload: Omit<PortalBookingPayload, 'patientId'>) => Appointment | null;
  cancelAppointment: (appointmentId: string) => void;
}

export const usePatientDataStore = create<PatientDataState>((set, get) => ({
  patientId: null,
  appointments: [],
  setPatientId: (patientId: string) => {
    set({
      patientId,
      appointments: getPatientAppointments(patientId),
    });
  },
  refreshAppointments: () => {
    const { patientId } = get();
    if (!patientId) return;
    set({ appointments: getPatientAppointments(patientId) });
  },
  bookAppointment: (payload) => {
    const { patientId } = get();
    if (!patientId) return null;
    const appointment = createPortalAppointment({
      patientId,
      ...payload,
    });
    set({
      appointments: getPatientAppointments(patientId),
    });
    return appointment;
  },
  cancelAppointment: (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, AppointmentStatus.CANCELLED);
    const { patientId } = get();
    if (patientId) {
      set({ appointments: getPatientAppointments(patientId) });
    }
  },
}));

