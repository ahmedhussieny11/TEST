import { apiClient } from './client';
import { LabTest } from '@/types';

export const labsApi = {
  list: (params?: { status?: string; patientId?: string }) =>
    apiClient.get<LabTest[]>('/lab-tests', { params }),
  create: (data: { patientId: string; testName: string; visitId?: string }) =>
    apiClient.post<LabTest>('/lab-tests', data),
  updateResults: (
    id: string,
    data: {
      value: string;
      unit?: string;
      normalRange?: string;
      notes?: string;
      status?: string;
    }
  ) => apiClient.patch<LabTest>(`/lab-tests/${id}/results`, data),
};
