import { create } from 'zustand';
import { Appointment } from '@/types';
import { patientPortalApi } from '@/api/patientPortal';

interface PatientDataState {
  appointments: Appointment[];
  refreshAppointments: () => Promise<void>;
  loadFromApi: () => Promise<void>;
  bookAppointment: (payload: {
    doctorId: string;
    date: string;
    time: string;
  }) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
}

export const usePatientDataStore = create<PatientDataState>((set) => ({
  appointments: [],
  loadFromApi: async () => {
    const { data } = await patientPortalApi.me();
    set({ appointments: data.appointments ?? [] });
  },
  refreshAppointments: async () => {
    const { data } = await patientPortalApi.me();
    set({ appointments: data.appointments ?? [] });
  },
  bookAppointment: async (payload) => {
    await patientPortalApi.book(payload);
    const { data } = await patientPortalApi.me();
    set({ appointments: data.appointments ?? [] });
  },
  cancelAppointment: async (appointmentId) => {
    await patientPortalApi.cancelAppointment(appointmentId);
    const { data } = await patientPortalApi.me();
    set({ appointments: data.appointments ?? [] });
  },
}));
