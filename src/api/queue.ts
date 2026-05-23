import { apiClient } from './client';

export const queueApi = {
  today: () => apiClient.get('/queue/today'),
  checkIn: (appointmentId: string) =>
    apiClient.post(`/queue/check-in/${appointmentId}`),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/queue/${id}/status`, { status }),
};
