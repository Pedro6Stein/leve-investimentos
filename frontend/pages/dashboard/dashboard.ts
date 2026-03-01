declare const UIkit: any;
import { loadMyTasks, loadManagedTasks, Task } from '../../services/taskService.js';
import { AuthUser } from '../../services/authService.js';
import { DataGrid } from '../../shared/components/DataGrid.js';
import { createUser } from '../../services/userService.js';
import { HttpError } from '../../services/httpClient.js';

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
            setupManagerActions();
        }

        await renderTasks(user.isManager);

        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.replace('/pages/login/index.html');
        });
    });
}

function setupManagerActions() {
    const formCadastro = document.getElementById('formCadastroUsuario') as HTMLFormElement;
    const btnSalvar = document.getElementById('btnSalvarUsuario') as HTMLButtonElement;

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();

            const originalText = btnSalvar.innerHTML;
            btnSalvar.innerHTML = '<div uk-spinner="ratio: 0.5"></div> Cadastrando...';
            btnSalvar.disabled = true;

            try {
                const fullName = (document.getElementById('newUserName') as HTMLInputElement).value;
                const email = (document.getElementById('newUserEmail') as HTMLInputElement).value;
                const password = (document.getElementById('newUserPassword') as HTMLInputElement).value;
                const birthDate = (document.getElementById('newUserBirthDate') as HTMLInputElement).value;
                const mobile = (document.getElementById('newUserMobile') as HTMLInputElement).value;
                const address = (document.getElementById('newUserAddress') as HTMLInputElement).value;
                const isManager = (document.getElementById('newUserIsManager') as HTMLInputElement).checked;

                // landline e photo são opcionais no Zod, então podemos enviá-los apenas se existirem no futuro
                await createUser({
                    fullName, email, password, birthDate, mobile, address, isManager
                });

                UIkit.notification({
                    message: `<span uk-icon='icon: check'></span> Usuário cadastrado com sucesso!`,
                    status: 'success',
                    pos: 'top-right'
                });

                formCadastro.reset();
                UIkit.modal('#modal-cadastro-usuario').hide();

            } catch (error) {
                if (error instanceof HttpError) {
                    // Tratamento das mensagens bonitinhas do Zod
                    if (error.details) {
                        for (const key in error.details) {
                            if (key !== '_errors' && error.details[key]._errors) {
                                error.details[key]._errors.forEach((msg: string) => {
                                    UIkit.notification({
                                        message: `<span uk-icon='icon: warning'></span> ${msg}`,
                                        status: 'danger',
                                        pos: 'top-right'
                                    });
                                });
                            }
                        }
                    } else {
                        // Erros genéricos do backend (ex: E-mail já cadastrado)
                        UIkit.notification({
                            message: `<span uk-icon='icon: warning'></span> ${error.message}`,
                            status: 'danger',
                            pos: 'top-right'
                        });
                    }
                } else {
                    UIkit.notification({
                        message: `<span uk-icon='icon: warning'></span> Erro interno ao cadastrar.`,
                        status: 'danger',
                        pos: 'top-right'
                    });
                }
            } finally {
                btnSalvar.innerHTML = originalText;
                btnSalvar.disabled = false;
            }
        });
    }
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
            { header: 'Descrição', key: 'description' },
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