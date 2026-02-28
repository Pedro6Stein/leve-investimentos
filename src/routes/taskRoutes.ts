import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { ensureManager, ensureAuthenticated } from '../middlewares/authMiddleware';

const taskRoutes = Router();
const taskController = new TaskController();

// Apenas gestores criam tarefas
taskRoutes.post('/', ensureManager, taskController.create);
taskRoutes.get('/my', ensureAuthenticated, taskController.listMyTasks); //Apenas usuários logados VÊEM as suas próprias tarefas
taskRoutes.patch('/:id/complete', ensureAuthenticated, taskController.complete);//Apenas usuários logados CONCLUEM tarefas
export { taskRoutes };