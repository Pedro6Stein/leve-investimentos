declare const UIkit: any;
import { loadMyTasks, loadManagedTasks, createTask, completeTask, updateTask, Task } from '../../services/taskService.js';
import { loadUsers, createUser } from '../../services/userService.js';
import { AuthUser } from '../../services/authService.js';
import { DataGrid } from '../../shared/components/DataGrid.js';
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

        if (user.isManager) {
            const managerActions = document.getElementById('managerActions');
            if (managerActions) managerActions.style.display = 'flex';
            await setupUserModal();
            await setupTaskModal();
            setupEditTaskModal();
        }
        await setupPerfilModal(user);
        await renderTasks(user.isManager);

        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.replace('/pages/login/index.html');
        });
    });
}

async function setupUserModal() {
    const form = document.getElementById('formCadastroUsuario') as HTMLFormElement;
    const btn = document.getElementById('btnSalvarUsuario') as HTMLButtonElement;
    const photoInput = document.getElementById('newUserPhoto') as HTMLInputElement;
    const photoPreview = document.getElementById('photoPreview') as HTMLImageElement;
    const photoPreviewContainer = document.getElementById('photoPreviewContainer') as HTMLElement;

    photoInput.addEventListener('change', () => {
        if (!photoInput.files?.length) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            photoPreview.src = e.target!.result as string;
            photoPreviewContainer.style.display = 'block';
        };
        reader.readAsDataURL(photoInput.files[0]);
    });

    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const originalText = btn.innerHTML;
        btn.innerHTML = '<div uk-spinner="ratio: 0.5"></div> Cadastrando...';
        btn.disabled = true;

        try {
            let photo: string | undefined;
            if (photoInput.files?.length) {
                photo = await fileToBase64(photoInput.files[0]);
            }

            await createUser({
                fullName: (document.getElementById('newUserName') as HTMLInputElement).value,
                email: (document.getElementById('newUserEmail') as HTMLInputElement).value,
                password: (document.getElementById('newUserPassword') as HTMLInputElement).value,
                birthDate: (document.getElementById('newUserBirthDate') as HTMLInputElement).value,
                mobile: (document.getElementById('newUserMobile') as HTMLInputElement).value,
                landline: (document.getElementById('newUserLandline') as HTMLInputElement).value || undefined,
                address: (document.getElementById('newUserAddress') as HTMLInputElement).value,
                isManager: (document.getElementById('newUserIsManager') as HTMLInputElement).checked,
                photo,
            });

            UIkit.notification({
                message: `<span uk-icon='icon: check'></span> Usuário cadastrado com sucesso!`,
                status: 'success',
                pos: 'top-right'
            });

            form.reset();
            photoPreviewContainer.style.display = 'none';
            UIkit.modal('#modal-cadastro-usuario').hide();
            await renderTasks(true);

        } catch (error) {
            const msg = error instanceof HttpError ? error.message : 'Erro interno ao cadastrar.';
            UIkit.notification({
                message: `<span uk-icon='icon: warning'></span> ${msg}`,
                status: 'danger',
                pos: 'top-right'
            });
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

async function setupTaskModal() {
    const select = document.getElementById('newTaskAssignee') as HTMLSelectElement;
    const form = document.getElementById('formNovaTarefa') as HTMLFormElement;
    const btn = document.getElementById('btnSalvarTarefa') as HTMLButtonElement;
    try {
        const users = await loadUsers();
        users.forEach(u => {
            const option = document.createElement('option');
            option.value = u.id;
            option.textContent = u.fullName;
            select.appendChild(option);
        });
    } catch {
        UIkit.notification({
            message: `<span uk-icon='icon: warning'></span> Erro ao carregar colaboradores.`,
            status: 'danger',
            pos: 'top-right'
        });
    }

    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const dueDate = (document.getElementById('newTaskDueDate') as HTMLInputElement).value;
        const today = new Date().toISOString().split('T')[0];

        if (dueDate < today) {
            UIkit.notification({
                message: `<span uk-icon='icon: warning'></span> A data limite não pode ser anterior a hoje.`,
                status: 'warning',
                pos: 'top-right'
            });
            return;
        }

        const originalText = btn.innerHTML;
        btn.innerHTML = '<div uk-spinner="ratio: 0.5"></div> Criando...';
        btn.disabled = true;

        try {
            await createTask({
                assigneeId: (document.getElementById('newTaskAssignee') as HTMLSelectElement).value,
                description: (document.getElementById('newTaskDescription') as HTMLTextAreaElement).value,
                dueDate: (document.getElementById('newTaskDueDate') as HTMLInputElement).value,
            });

            UIkit.notification({
                message: `<span uk-icon='icon: check'></span> Tarefa criada com sucesso!`,
                status: 'success',
                pos: 'top-right'
            });

            form.reset();
            UIkit.modal('#modal-nova-tarefa').hide();
            await renderTasks(true);

        } catch (error) {
            const msg = error instanceof HttpError ? error.message : 'Erro interno ao criar tarefa.';
            UIkit.notification({
                message: `<span uk-icon='icon: warning'></span> ${msg}`,
                status: 'danger',
                pos: 'top-right'
            });
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

function setupEditTaskModal() {
    const btn = document.getElementById('btnSalvarEdicao') as HTMLButtonElement;
    const today = new Date().toISOString().split('T')[0];

    btn.addEventListener('click', async (e) => {
        e.preventDefault();

        const id = (document.getElementById('editTaskId') as HTMLInputElement).value;
        const assigneeId = (document.getElementById('editTaskAssignee') as HTMLSelectElement).value;
        const description = (document.getElementById('editTaskDescription') as HTMLTextAreaElement).value;
        const dueDate = (document.getElementById('editTaskDueDate') as HTMLInputElement).value;

        if (!assigneeId || !description || !dueDate) {
            UIkit.notification({
                message: `<span uk-icon='icon: warning'></span> Preencha todos os campos.`,
                status: 'warning',
                pos: 'top-right'
            });
            return;
        }

        if (dueDate < today) {
            UIkit.notification({
                message: `<span uk-icon='icon: warning'></span> A data limite não pode ser anterior a hoje.`,
                status: 'warning',
                pos: 'top-right'
            });
            return;
        }

        const originalText = btn.innerHTML;
        btn.innerHTML = '<div uk-spinner="ratio: 0.5"></div> Salvando...';
        btn.disabled = true;

        try {
            await updateTask(id, { assigneeId, description, dueDate });

            UIkit.notification({
                message: `<span uk-icon='icon: check'></span> Tarefa atualizada com sucesso!`,
                status: 'success',
                pos: 'top-right'
            });

            UIkit.modal('#modal-editar-tarefa').hide();
            await renderTasks(true);

        } catch (error) {
            const msg = error instanceof HttpError ? error.message : 'Erro ao salvar alterações.';
            UIkit.notification({
                message: `<span uk-icon='icon: warning'></span> ${msg}`,
                status: 'danger',
                pos: 'top-right'
            });
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

function openEditModal(task: Task) {
    const editSelect = document.getElementById('editTaskAssignee') as HTMLSelectElement;

    (document.getElementById('editTaskId') as HTMLInputElement).value = task.id;
    (document.getElementById('editTaskDescription') as HTMLTextAreaElement).value = task.description;
    (document.getElementById('editTaskDueDate') as HTMLInputElement).value = task.dueDate.substring(0, 10);

    Array.from(editSelect.options).forEach(opt => {
        opt.selected = opt.value === task.assigneeId;
    });

    UIkit.modal('#modal-editar-tarefa').show();
}

async function renderTasks(isManager: boolean) {
    const container = document.getElementById('tasksGridContainer');
    if (!container) return;

    container.innerHTML = `<div class="uk-text-center uk-padding"><div uk-spinner></div></div>`;

    try {
        const tasks = isManager ? await loadManagedTasks() : await loadMyTasks();

        const columns = [
            {
                header: isManager ? 'Colaborador' : 'Gestor',
                key: isManager ? 'assignee.fullName' : 'manager.fullName'
            },
            { header: 'Descrição', key: 'description' },
            {
                header: 'Prazo',
                key: 'dueDate',
                render: (task: Task) => new Date(task.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
            },
            {
                header: 'Status',
                key: 'status',
                render: (task: Task) => {
                    const isPending = task.status === 1;
                    return `<span class="status-badge ${isPending ? 'status-pendente' : 'status-concluida'}">${isPending ? 'Pendente' : 'Concluída'}</span>`;
                }
            },
            ...(!isManager ? [{
                header: 'Ação',
                key: 'id',
                render: (task: Task) => task.status === 1
                    ? `<button class="uk-button uk-button-primary uk-button-small redondo btn-concluir" data-id="${task.id}">Concluir</button>`
                    : '—'
            }] : [])
        ];

        const grid = new DataGrid<Task>('tasksGridContainer', columns);
        grid.render(tasks);

        if (isManager) {
            container.querySelectorAll<HTMLTableRowElement>('tbody tr').forEach((row, index) => {
                row.style.cursor = 'pointer';
                row.title = 'Duplo clique para editar';
                row.addEventListener('dblclick', () => openEditModal(tasks[index]));
            });

            const editSelect = document.getElementById('editTaskAssignee') as HTMLSelectElement;
            if (editSelect.options.length <= 1) {
                const users = await loadUsers();
                users.forEach(u => {
                    const option = document.createElement('option');
                    option.value = u.id;
                    option.textContent = u.fullName;
                    editSelect.appendChild(option);
                });
            }
        }

        if (!isManager) {
            container.querySelectorAll<HTMLButtonElement>('.btn-concluir').forEach(btn => {
                btn.addEventListener('click', async () => {
                    btn.disabled = true;
                    btn.innerHTML = '<div uk-spinner="ratio: 0.4"></div>';
                    try {
                        await completeTask(btn.dataset.id!);
                        UIkit.notification({
                            message: `<span uk-icon='icon: check'></span> Tarefa concluída!`,
                            status: 'success',
                            pos: 'top-right'
                        });
                        await renderTasks(false);
                    } catch {
                        UIkit.notification({
                            message: `<span uk-icon='icon: warning'></span> Erro ao concluir tarefa.`,
                            status: 'danger',
                            pos: 'top-right'
                        });
                        btn.disabled = false;
                        btn.innerHTML = 'Concluir';
                    }
                });
            });
        }

    } catch {
        container.innerHTML = '<div class="uk-alert-danger" uk-alert><p>Erro ao carregar tarefas do servidor.</p></div>';
    }
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => reject(new Error('Erro ao processar imagem.'));
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 400;
                let { width, height } = img;
                if (width > height) {
                    if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
                } else {
                    if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target!.result as string;
        };
        reader.readAsDataURL(file);
    });
}

async function setupPerfilModal(user: AuthUser) {
    const btn = document.getElementById('perfilBtn');

    btn?.addEventListener('click', async (e) => {
        e.preventDefault();

        try {
            const users = await loadUsers();
            const fullUser = users.find(u => u.id === user.id);

            (document.getElementById('perfilNome') as HTMLElement).innerText = user.fullName;
            (document.getElementById('perfilEmail') as HTMLElement).innerText = user.email;
            (document.getElementById('perfilBadge') as HTMLElement).innerText = user.isManager ? 'Gestor' : 'Colaborador';
            (document.getElementById('perfilBadge') as HTMLElement).style.background = user.isManager ? 'var(--primary-color)' : 'var(--border-color)';
            (document.getElementById('perfilMobile') as HTMLElement).innerText = fullUser?.mobile ?? '—';
            (document.getElementById('perfilLandline') as HTMLElement).innerText = fullUser?.landline ?? '—';
            (document.getElementById('perfilAddress') as HTMLElement).innerText = fullUser?.address ?? '—';
            (document.getElementById('perfilBirthDate') as HTMLElement).innerText = fullUser?.birthDate
                ? new Date(fullUser.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                : '—';

        } catch {
            UIkit.notification({
                message: `<span uk-icon='icon: warning'></span> Erro ao carregar perfil.`,
                status: 'danger',
                pos: 'top-right'
            });
        }

        UIkit.modal('#modal-perfil').show();
    });
}