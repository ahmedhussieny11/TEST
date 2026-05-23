import axios from 'axios';
import { getApiBaseUrl } from '@/config/runtime';

const publicClient = axios.create({
  baseURL: getApiBaseUrl(),
});

export interface BookingService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  visitType: string;
}

export interface SlotInfo {
  time: string;
  remaining: number;
  isFull: boolean;
}

export const publicBookingApi = {
  setBaseUrl: (baseURL: string) => {
    publicClient.defaults.baseURL = baseURL;
  },

  getConfig: () =>
    publicClient.get<{
      branding: { name: string; tagline: string };
      settings: {
        slotsPerHour: number;
        workingHours: { start: string; end: string };
        workingDays: number[];
      };
      services: BookingService[];
      doctors: { id: string; name: string }[];
    }>('/public/booking/config'),

  getSlots: (date: string, doctorId?: string) =>
    publicClient.get<{ slots: SlotInfo[]; slotsPerHour: number; doctorId: string }>(
      '/public/booking/slots',
      { params: { date, doctorId } }
    ),

  guestBook: (data: {
    name: string;
    phone: string;
    email?: string;
    serviceId: string;
    date: string;
    time: string;
    doctorId?: string;
  }) => publicClient.post('/public/booking', data),
};
