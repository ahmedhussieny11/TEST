import { apiClient } from './client';

export const filesApi = {
  upload: (file: File, patientId: string, visitId?: string, type?: string) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post('/files/upload', form, {
      params: { patientId, visitId, type },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  byPatient: (patientId: string) =>
    apiClient.get(`/files/patient/${patientId}`),
};
