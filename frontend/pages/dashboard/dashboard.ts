declare const UIkit: any;
import { loadMyTasks, loadManagedTasks, Task } from '../../services/taskService.js';
import { AuthUser } from '../../services/authService.js';
import { DataGrid } from '../../shared/components/DataGrid.js';

const token = localStorage.getItem('@Leve:token');
const userRaw = localStorage.getItem('@Leve:user');

if (!token || !userRaw) {
    window.location.replace('/pages/login/index.html');
} else {
    const user: AuthUser = JSON.parse(userRaw);

    document.addEventListener('DOMContentLoaded', async () => {
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) userNameDisplay.innerText = user.fullName;

        const managerActions = document.getElementById('managerActions');
        if (managerActions && user.isManager) {
            managerActions.style.display = 'block';
        }

        await renderTasks(user.isManager);

        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.replace('/pages/login/index.html');
        });
    });
}

async function renderTasks(isManager: boolean) {
    const container = document.getElementById('tasksGridContainer');
    if (!container) return;

    try {
        const tasks = isManager ? await loadManagedTasks() : await loadMyTasks();

        const grid = new DataGrid<Task>('tasksGridContainer', [
            {
                header: isManager ? 'Colaborador' : 'Gestor',
                key: isManager ? 'assignee.fullName' : 'manager.fullName'
            },
            { 
                header: 'Descrição', 
                key: 'description' 
            },
            {
                header: 'Prazo',
                key: 'dueDate',
                render: (task) => new Date(task.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
            },
            {
                header: 'Status',
                key: 'status',
                render: (task) => {
                    const isPending = task.status === 1;
                    const statusClass = isPending ? 'status-pendente' : 'status-concluida';
                    const statusText = isPending ? 'Pendente' : 'Concluída';
                    return `<span class="status-badge ${statusClass}">${statusText}</span>`;
                }
            }
        ]);

        grid.render(tasks);

    } catch (error) {
        container.innerHTML = '<div class="uk-alert-danger" uk-alert><p>Erro ao carregar tarefas do servidor.</p></div>';
    }
}