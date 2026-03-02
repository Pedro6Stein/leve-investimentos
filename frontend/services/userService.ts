import { api } from './api.js';

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  landline?: string | null;
  address?: string;
  birthDate?: string;
  isManager: boolean;
  createdAt: string;
  photo?: string;
}

export interface CreateUserData {
  fullName: string;
  birthDate: string;
  landline?: string;
  mobile: string;
  email: string;
  password: string;
  address: string;
  photo?: string;
  isManager?: boolean;
}

export async function loadUsers(): Promise<User[]> {
  return api.get<User[]>('/users');
}

export async function loadMe(): Promise<User> {
  return api.get<User>('/users/me');
}

export async function createUser(data: CreateUserData): Promise<User> {
  return api.post<User>('/users', data);
}