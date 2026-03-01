import { api } from '../../../../app/providers/api.js';
import { AuthUserDTO } from '../../../../entities/user/model/types.js';

export interface LoginResponse {
    token: string;
    user: AuthUserDTO;
}

export async function loginByEmail(email: string, password: string): Promise<LoginResponse> {
    // A Feature apenas consome a API e retorna o contrato (DTO). Ela não sabe o que é UIkit ou HTML.
    return api.post<LoginResponse>('/auth/login', { email, password });
}
