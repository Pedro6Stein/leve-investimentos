export enum TaskStatus {
    PENDING = 1,
    COMPLETED = 2
}

export interface Task {
    id: string;
    managerId: string;
    assigneeId: string;
    description: string;
    dueDate: string;
    status: TaskStatus;
    createdAt: string;
    completedAt?: string | null;
}

export interface TaskWithAssigneeDTO extends Omit<Task, 'managerId' | 'assigneeId'> {
    assignee: {
        fullName: string;
        email?: string;
    };
    manager?: {
        fullName: string;
    };
}
