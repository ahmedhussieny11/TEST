import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export const patientApiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export function setPatientToken(token: string | null) {
  if (token) {
    patientApiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete patientApiClient.defaults.headers.common.Authorization;
  }
}
