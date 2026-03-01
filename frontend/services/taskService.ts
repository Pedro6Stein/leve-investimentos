import { api } from './api.js';

export interface Task {
    id: string;
    managerId: string;
    assigneeId: string;
    description: string;
    dueDate: string;
    status: number;
    createdAt: string;
    completedAt?: string | null;
    assignee?: {
        fullName: string;
        email?: string;
    };
    manager?: {
        fullName: string;
    };
}

export async function loadMyTasks(): Promise<Task[]> {
    return api.get<Task[]>('/tasks/my');
}

export async function loadManagedTasks(): Promise<Task[]> {
    return api.get<Task[]>('/tasks/managed');
}