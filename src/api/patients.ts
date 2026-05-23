import { apiClient } from './client';
import { Patient } from '@/types';

export const patientsApi = {
  list: (search?: string) =>
    apiClient.get<Patient[]>('/patients', { params: { search } }),
  get: (id: string) => apiClient.get<Patient>(`/patients/${id}`),
  create: (data: Partial<Patient>) => apiClient.post<Patient>('/patients', data),
  quickRegister: (data: { name: string; phone: string }) =>
    apiClient.post<Patient>('/patients/quick', data),
  update: (id: string, data: Partial<Patient>) =>
    apiClient.patch<Patient>(`/patients/${id}`, data),
  timeline: (id: string) => apiClient.get(`/patients/${id}/timeline`),
  createPregnancy: (patientId: string, lmpDate: string) =>
    apiClient.post(`/patients/${patientId}/pregnancies`, { lmpDate }),
};
