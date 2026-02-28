import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class TaskController {
    //cria task
    create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { assigneeId, description, dueDate } = req.body;
            const managerId = req.user?.userId; // O ID do gestor vem do Token

            if (!assigneeId || !description || !dueDate) {
                res.status(400).json({ error: 'Dados da tarefa incompletos.' });
                return;
            }

            const task = await prisma.task.create({
                data: {
                    description,
                    dueDate: new Date(dueDate),
                    managerId: managerId!,
                    assigneeId,
                    status: 1, // 1 = Pendente.
                }
            });

            res.status(201).json(task);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar tarefa.' });
        }
    };
    //Lista task
    listMyTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;

            // Lista tarefas onde o usuário logado é o responsável (assignee)
            const tasks = await prisma.task.findMany({
                where: { assigneeId: userId },
                include: {
                    manager: { select: { fullName: true } }
                },
                orderBy: { dueDate: 'asc' }
            });

            res.status(200).json(tasks);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar tarefas.' });
        }
    };

    listManagedTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const managerId = req.user?.userId;
            const tasks = await prisma.task.findMany({
                where: { managerId },
                include: {
    
                    assignee: { select: { fullName: true, email: true } }
                },
                orderBy: { dueDate: 'asc' }
            });

            res.status(200).json(tasks);
        } catch (error) {
            console.error("ERRO AO LISTAR TAREFAS DA EQUIPA:", error);
            res.status(500).json({ error: 'Erro ao listar tarefas da equipa.' });
        }
    };
    
    //Se task completada ---> muda a data e coloca um "check"
    complete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const id = String(req.params.id);
            const userId = req.user?.userId;
            const isManager = req.user?.isManager;

            if (!id) {
                res.status(400).json({ error: 'ID da tarefa é obrigatório.' });
                return;
            }
            //Busca a tarefa no banco para saber de quem ela é
            const task = await prisma.task.findUnique({ where: { id } });
            if (!task) {
                res.status(404).json({ error: 'Tarefa não encontrada.' });
                return;
            }
            // O usuário logado é o dono da tarefa? Ou ele é um gestor?
            if (task.assigneeId !== userId && !isManager) {
                res.status(403).json({ error: 'Acesso negado. Você só pode concluir suas próprias tarefas.' });
                return;
            }
            // Se passou pelas validações de segurança, altera o status
            const updatedTask = await prisma.task.update({
                where: { id },
                data: {
                    status: 2,
                    completedAt: new Date(),
                },
            });
            res.status(200).json(updatedTask);
        } catch (error) {
            console.error("ERRO AO CONCLUIR TAREFA:", error);
            res.status(500).json({ error: 'Erro ao concluir tarefa.' });
        }
    }
}