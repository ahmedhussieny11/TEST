import { patientApiClient } from './client';

export type PatientUploadItem = {
  id: string;
  kind: 'lab' | 'sonar';
  title: string;
  filePath: string;
  createdAt: string;
  labId?: string;
  attachmentId?: string;
  mimeType?: string | null;
};

export type PatientSession = {
  patient: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
  };
  token: string;
};

export const patientPortalApi = {
  doctors: () => patientApiClient.get('/patient/doctors'),
  login: (phone: string) =>
    patientApiClient.post<PatientSession>('/patient/login', { phone }),
  register: (data: {
    name: string;
    phone: string;
    email?: string;
    age?: number;
    address?: string;
  }) => patientApiClient.post<PatientSession>('/patient/register', data),
  me: () => patientApiClient.get('/patient/me'),
  updateProfile: (data: {
    name?: string;
    email?: string;
    address?: string;
    age?: number;
  }) => patientApiClient.patch('/patient/profile', data),
  queueStatus: () =>
    patientApiClient.get<{
      status:
        | 'waiting'
        | 'in_exam'
        | 'done'
        | 'not_in_queue'
        | 'no_appointment';
      message?: string;
      queueNumber?: number | null;
      aheadCount?: number;
      estimatedMinutes?: number;
      appointmentTime?: string;
      doctorName?: string;
    }>('/patient/queue-status'),
  book: (data: {
    doctorId: string;
    date: string;
    time: string;
    serviceId?: string;
  }) => patientApiClient.post('/patient/appointments', data),
  cancelAppointment: (id: string) =>
    patientApiClient.post(`/patient/appointments/${id}/cancel`),
  uploadLabImage: (labId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return patientApiClient.post(`/patient/lab-tests/${labId}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  myUploads: () => patientApiClient.get<PatientUploadItem[]>('/patient/my-uploads'),
  deleteLabUpload: (labId: string) =>
    patientApiClient.delete(`/patient/lab-tests/${labId}/upload`),
  deleteAttachment: (attachmentId: string) =>
    patientApiClient.delete(`/patient/attachments/${attachmentId}`),
  replaceLabUpload: (labId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return patientApiClient.post(`/patient/lab-tests/${labId}/replace`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  replaceAttachment: (attachmentId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return patientApiClient.post(`/patient/attachments/${attachmentId}/replace`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMedical: (file: File, category: 'lab' | 'sonar', testName?: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('category', category);
    if (testName?.trim()) form.append('testName', testName.trim());
    return patientApiClient.post('/patient/uploads', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
