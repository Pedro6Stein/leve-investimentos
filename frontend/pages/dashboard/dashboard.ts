declare const UIkit: any;
import { loadMyTasks, loadManagedTasks, Task } from '../../services/taskService.js';
import { AuthUser } from '../../services/authService.js';

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

        if (tasks.length === 0) {
            container.innerHTML = '<div class="uk-alert-warning" uk-alert><p>Nenhuma tarefa encontrada.</p></div>';
            return;
        }

        let html = `
            <table class="uk-table uk-table-hover uk-table-divider">
                <thead>
                    <tr>
                        <th>${isManager ? 'Colaborador' : 'Gestor'}</th>
                        <th>Descrição</th>
                        <th>Prazo</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        tasks.forEach((task: Task) => {
            const date = new Date(task.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            const isPending = task.status === 1;
            const statusClass = isPending ? 'status-pendente' : 'status-concluida';
            const statusText = isPending ? 'Pendente' : 'Concluída';
            const personName = isManager
                ? (task.assignee?.fullName ?? '—')
                : (task.manager?.fullName ?? '—');

            html += `
                <tr>
                    <td class="uk-text-bold">${personName}</td>
                    <td>${task.description}</td>
                    <td>${date}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = '<div class="uk-alert-danger" uk-alert><p>Erro ao carregar tarefas do servidor.</p></div>';
    }
}