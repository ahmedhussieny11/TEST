import { getApiBaseUrl } from '@/config/runtime';
import { apiClient, patientApiClient } from './client';
import { publicBookingApi } from './publicBooking';
import { quickCaptureApi } from './quickCapture';

export function applyApiBaseUrl() {
  const baseURL = getApiBaseUrl();
  apiClient.defaults.baseURL = baseURL;
  patientApiClient.defaults.baseURL = baseURL;
  publicBookingApi.setBaseUrl(baseURL);
  quickCaptureApi.setBaseUrl(baseURL);
}
