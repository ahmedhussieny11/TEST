import { apiClient } from './client';
import { User } from '@/types';

export interface LoginResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>('/auth/login', { email, password }),
  me: () => apiClient.get<User>('/auth/me'),
};
