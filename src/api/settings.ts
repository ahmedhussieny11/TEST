import { apiClient } from './client';
import { AppointmentSettings } from '@/types';

export const settingsApi = {
  get: () =>
    apiClient.get<AppointmentSettings & { id: string; bookingServices?: AppointmentSettings['bookingServices'] }>(
      '/settings'
    ),
  update: (data: Partial<AppointmentSettings>) =>
    apiClient.patch('/settings', data),
};
