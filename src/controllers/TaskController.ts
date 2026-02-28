import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class TaskController {
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
}