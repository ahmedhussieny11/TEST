import { apiClient } from './client';

export const shiftsApi = {
  getOpen: () => apiClient.get('/shifts/open'),
  open: (openingBalance: number) =>
    apiClient.post('/shifts/open', { openingBalance }),
  close: (id: string, actualCash: number, notes?: string) =>
    apiClient.post(`/shifts/${id}/close`, { actualCash, notes }),
  dailyReport: (id: string) => apiClient.get(`/shifts/${id}/daily-report`),
};
