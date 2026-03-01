import { api } from './api.js';

export interface User {
    id: string;
    fullName: string;
    email: string;
    mobile: string;
    isManager: boolean;
    createdAt: string;
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

export async function createUser(data: CreateUserData): Promise<User> {
    return api.post<User>('/users', data);
}