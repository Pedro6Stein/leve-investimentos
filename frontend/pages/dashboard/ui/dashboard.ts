import { loadMyTasks } from '../../../features/task/list/api/loadTasks.js';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('@Leve:token');
    const userRaw = localStorage.getItem('@Leve:user');

    // GUARDA DE ROTA: Segurança FSD
    if (!token || !userRaw) {
        window.location.href = '../../login/ui/index.html';
        return;
    }

    const user = JSON.parse(userRaw);

    // IDENTIFICAÇÃO
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) userNameDisplay.innerText = user.fullName;

    // PERMISSÕES GLOBAIS DA PÁGINA
    const managerActions = document.getElementById('managerActions');
    if (managerActions && user.isManager) {
        managerActions.style.display = 'block';
    }

    // CARREGAMENTO DE DADOS (Consome a Feature)
    await renderTasks();

    // LOGOUT
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('@Leve:token');
        localStorage.removeItem('@Leve:user');
        window.location.href = '../../login/ui/index.html';
    });
});

async function renderTasks() {
    const container = document.getElementById('tasksGridContainer');
    if (!container) return;

    try {
        const tasks = await loadMyTasks();

        if (tasks.length === 0) {
            container.innerHTML = '<div class="uk-alert-warning" uk-alert><p>Nenhuma tarefa encontrada.</p></div>';
            return;
        }

        let html = `
            <table class="uk-table uk-table-hover uk-table-divider">
                <thead>
                    <tr>
                        <th>Responsável</th>
                        <th>Descrição</th>
                        <th>Prazo</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        tasks.forEach(task => {
            const date = new Date(task.dueDate).toLocaleDateString('pt-BR');
            const isPending = task.status === 1; 
            const statusClass = isPending ? 'status-pendente' : 'status-concluida';
            const statusText = isPending ? 'Pendente' : 'Concluída';

            html += `
                <tr>
                    <td class="uk-text-bold">${task.assignee?.fullName || 'Eu'}</td>
                    <td>${task.description}</td>
                    <td>${date}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        console.error("Erro ao renderizar tarefas:", error);
        container.innerHTML = '<div class="uk-alert-danger" uk-alert><p>Erro ao carregar tarefas do servidor.</p></div>';
    }
}