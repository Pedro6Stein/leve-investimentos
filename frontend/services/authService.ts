import { api } from './api.js';

export interface AuthUser {
    id: string;
    fullName: string;
    email: string;
    isManager: boolean;
}

export interface LoginResponse {
    token: string;
    user: AuthUser;
}

export async function loginByEmail(email: string, password: string): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', { email, password });
}