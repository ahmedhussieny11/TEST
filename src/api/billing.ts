import { apiClient } from './client';
import { Invoice } from '@/types';

export const billingApi = {
  services: () => apiClient.get('/services'),
  invoices: () => apiClient.get<Invoice[]>('/invoices'),
  createInvoice: (data: Record<string, unknown>) =>
    apiClient.post<Invoice>('/invoices', data),
  addPayment: (id: string, amount: number, method?: string) =>
    apiClient.post<Invoice>(`/invoices/${id}/payments`, { amount, method }),
  collectPayment: (id: string, amount?: number, method?: string) =>
    apiClient.post<Invoice>(`/invoices/${id}/payments`, {
      amount: amount ?? 0,
      method: method ?? 'cash',
    }),
};
