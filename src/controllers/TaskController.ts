import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { EmailService } from '../services/EmailService';

const emailService = new EmailService();

export class TaskController {
    // cria task
  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { assigneeId, description, dueDate } = req.body;
            const managerId = req.user?.userId;

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

            // LOGICA DE EMAIL (Com o Gestor em Cópia)
            const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
            const managerEmail = req.user?.email; // Pegamos o e-mail do gestor logado direto do token

            if (assignee && managerEmail) {
                // Passamos o managerEmail como o segundo parâmetro (CC)
                emailService.sendTaskAssignedEmail(assignee.email, managerEmail, assignee.fullName, description);
            }

            // Resposta de sucesso no final
            res.status(201).json(task);

        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar tarefa.' });
        }
    };

    // Lista task
    listMyTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const tasks = await prisma.task.findMany({
                where: { assigneeId: userId },
                include: { manager: { select: { fullName: true } } },
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
                include: { assignee: { select: { fullName: true, email: true } } },
                orderBy: { dueDate: 'asc' }
            });
            res.status(200).json(tasks);
        } catch (error) {
            console.error("ERRO AO LISTAR TAREFAS DA EQUIPA:", error);
            res.status(500).json({ error: 'Erro ao listar tarefas da equipa.' });
        }
    };
    
    // Se task completada ---> muda a data, coloca um "check" e AVISA O GESTOR
    complete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const id = String(req.params.id);

            if (!id) {
                res.status(400).json({ error: 'ID da tarefa é obrigatório.' });
                return;
            }

            // Busca a tarefa ANTES de atualizar para ter os e-mails do gestor e subordinado
            const taskInfo = await prisma.task.findUnique({
                where: { id },
                include: { manager: true, assignee: true }
            });

            if (!taskInfo) {
                res.status(404).json({ error: 'Tarefa não encontrada.' });
                return;
            }

            // Atualiza a tarefa para concluída
            const updatedTask = await prisma.task.update({
                where: { id },
                data: {
                    status: 2, // 2 = Concluída
                    completedAt: new Date(),
                },
            });

            // ispara o e-mail para o Gestor
            if (taskInfo.manager && taskInfo.assignee) {
                emailService.sendTaskCompletedEmail(
                    taskInfo.manager.email,
                    taskInfo.manager.fullName,
                    taskInfo.assignee.fullName,
                    taskInfo.description
                );
            }

            res.status(200).json(updatedTask);
        } catch (error) {
            console.error("ERRO AO CONCLUIR TAREFA:", error);
            res.status(500).json({ error: 'Erro ao concluir tarefa.' });
        }
    };
}