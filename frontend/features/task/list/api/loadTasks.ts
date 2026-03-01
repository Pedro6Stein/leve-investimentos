import { api } from '../../../../app/providers/api.js';
import { TaskWithAssigneeDTO } from '../../../../entities/task/model/types.js';

export async function loadMyTasks(): Promise<TaskWithAssigneeDTO[]> {
    // Separação de Responsabilidades: A Feature sabe ONDE buscar, a UI apenas desenha.
    return api.get<TaskWithAssigneeDTO[]>('/tasks/my');
}
