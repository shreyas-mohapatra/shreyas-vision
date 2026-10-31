import api from './axios.js';

export interface User {
  id: string;
  email: string;
  fullName: string;
  region?: string;
  language: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function register(data: { email: string; password: string; fullName: string; region?: string }): Promise<AuthResponse> {
  const res = await api.post('/auth/register', data);
  return res.data;
}

export async function login(data: { email: string; password: string }): Promise<AuthResponse> {
  const res = await api.post('/auth/login', data);
  return res.data;
}

export async function getMe(): Promise<{ user: User }> {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function updateProfile(data: { fullName?: string; region?: string; language?: string }): Promise<{ user: User }> {
  const res = await api.patch('/auth/me', data);
  return res.data;
}

export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
  const res = await api.post('/auth/change-password', data);
  return res.data;
}

export async function deleteAccount(data: { password: string }): Promise<{ message: string }> {
  const res = await api.delete('/auth/me', { data });
  return res.data;
}
