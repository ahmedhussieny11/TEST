import { apiClient } from './client';
import { Appointment } from '@/types';

export const appointmentsApi = {
  list: (from?: string, to?: string, doctorId?: string) =>
    apiClient.get<Appointment[]>('/appointments', { params: { from, to, doctorId } }),
  today: () => apiClient.get<Appointment[]>('/appointments/today'),
  get: (id: string) => apiClient.get<Appointment>(`/appointments/${id}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post<Appointment>('/appointments', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch<Appointment>(`/appointments/${id}`, data),
  confirm: (id: string) => apiClient.patch<Appointment>(`/appointments/${id}/confirm`),
  cancel: (id: string) => apiClient.delete(`/appointments/${id}`),
};
