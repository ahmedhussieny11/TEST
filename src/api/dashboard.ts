import { apiClient } from './client';
import { DashboardStats } from '@/types';

export const dashboardApi = {
  summary: (date?: string) =>
    apiClient.get<DashboardStats>('/dashboard/summary', { params: { date } }),
};
