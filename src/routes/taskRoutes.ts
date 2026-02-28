import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { ensureManager } from '../middlewares/authMiddleware';

const taskRoutes = Router();
const taskController = new TaskController();

// Apenas gestores criam tarefas
taskRoutes.post('/', ensureManager, taskController.create);
taskRoutes.get('/my', taskController.listMyTasks); //livre, qualquer user logado consegue ver suas propias task

export { taskRoutes };