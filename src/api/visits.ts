import { apiClient } from './client';
import { ClinicalVisit } from '@/types';

export const visitsApi = {
  list: (patientId?: string) =>
    apiClient.get<ClinicalVisit[]>('/visits', { params: { patientId } }),
  get: (id: string) => apiClient.get<ClinicalVisit>(`/visits/${id}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ClinicalVisit>('/visits', data),
};
