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

export interface CreateTaskData {
    assigneeId: string;
    description: string;
    dueDate: string;
}

export interface UpdateTaskData {
    assigneeId?: string;
    description?: string;
    dueDate?: string;
}

export async function loadMyTasks(): Promise<Task[]> {
    return api.get<Task[]>('/tasks/my');
}

export async function loadManagedTasks(): Promise<Task[]> {
    return api.get<Task[]>('/tasks/managed');
}

export async function createTask(data: CreateTaskData): Promise<Task> {
    return api.post<Task>('/tasks', data);
}

export async function completeTask(taskId: string): Promise<Task> {
    return api.patch<Task>(`/tasks/${taskId}/complete`);
}

export async function updateTask(taskId: string, data: UpdateTaskData): Promise<Task> {
    return api.patch<Task>(`/tasks/${taskId}`, data);
}