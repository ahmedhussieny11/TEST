import axios from 'axios';
import { getApiBaseUrl } from '@/config/runtime';
import { apiClient } from './client';

const publicClient = axios.create({
  baseURL: getApiBaseUrl(),
});

export type QuickCaptureSession = {
  id: string;
  code: string;
  patientId: string;
  visitId?: string | null;
  expiresAt: string;
  patientName?: string;
};

export const quickCaptureApi = {
  setBaseUrl: (baseURL: string) => {
    publicClient.defaults.baseURL = baseURL;
  },

  createSession: (patientId: string, visitId?: string) =>
    apiClient.post<QuickCaptureSession>('/quick-capture/session', { patientId, visitId }),

  getSessionInfo: (code: string) =>
    publicClient.get<{ patientName: string; expiresAt: string }>(
      `/public/quick-capture/${code}`
    ),

  upload: (code: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return publicClient.post(`/public/quick-capture/${code}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
