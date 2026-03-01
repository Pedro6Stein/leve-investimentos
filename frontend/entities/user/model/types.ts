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
