import { apiClient } from './client';
import { User, UserRole } from '@/types';

export type CreateUserPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: UserRole;
};

export const usersApi = {
  list: () => apiClient.get<User[]>('/users'),
  create: (data: CreateUserPayload) => apiClient.post<User>('/users', data),
  update: (id: string, data: UpdateUserPayload) =>
    apiClient.patch<User>(`/users/${id}`, data),
  remove: (id: string) => apiClient.delete(`/users/${id}`),
};
