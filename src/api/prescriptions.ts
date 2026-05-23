import { apiClient } from './client';
import { Prescription } from '@/types';

export const prescriptionsApi = {
  list: (patientId?: string) =>
    apiClient.get<Prescription[]>('/prescriptions', { params: { patientId } }),
  create: (data: Record<string, unknown>) =>
    apiClient.post<Prescription>('/prescriptions', data),
  templates: (doctorId?: string) =>
    apiClient.get('/prescription-templates', {
      params: doctorId ? { doctorId } : undefined,
    }),
  suggestedTemplates: (params?: { pregnancyMonth?: number; doctorId?: string }) =>
    apiClient.get('/prescription-templates/suggested', { params }),
  createTemplate: (data: Record<string, unknown>) =>
    apiClient.post('/prescription-templates', data),
  updateTemplate: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/prescription-templates/${id}`, data),
  deleteTemplate: (id: string) => apiClient.delete(`/prescription-templates/${id}`),
};
