export interface User {
    id: string;
    fullName: string;
    birthDate: string;
    landline?: string | null;
    mobile: string;
    email: string;
    address: string;
    photo?: string | null;
    isManager: boolean;
    createdAt: string;
}

export interface AuthUserDTO {
    id: string;
    fullName: string;
    email: string;
    isManager: boolean;
}

export interface CreateUserDTO {
    fullName: string;
    birthDate: string;      // "YYYY-MM-DD"
    landline?: string;
    mobile: string;
    email: string;
    password: string;
    address: string;
    photo?: string;         // base64
    isManager?: boolean;
}

export interface CreatedUserDTO {
    id: string;
    fullName: string;
    email: string;
    mobile: string;
    landline?: string | null;
    address: string;
}