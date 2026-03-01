// features/user/create/api/createUser.ts

import { api } from '../../app/providers/api.js';
import { CreateUserDTO, CreatedUserDTO } from '../../entities/user/model/types.js';

export async function createUser(dto: CreateUserDTO): Promise<CreatedUserDTO> {
    return api.post<CreatedUserDTO>('/users', dto);
}