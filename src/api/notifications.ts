import { apiClient } from './client';

export type ClinicNotification = {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  patientId?: string | null;
  labTestId?: string | null;
  read: boolean;
  createdAt: string;
};

export const notificationsApi = {
  list: () =>
    apiClient.get<{ items: ClinicNotification[]; unreadCount: number }>('/notifications'),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
};
