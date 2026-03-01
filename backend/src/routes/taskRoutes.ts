import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { ensureManager, ensureAuthenticated } from '../middlewares/authMiddleware';

const taskRoutes = Router();
const taskController = new TaskController();

// Apenas gestores criam tarefas
taskRoutes.post('/', ensureManager, taskController.create);
taskRoutes.get('/my', ensureAuthenticated, taskController.listMyTasks); //Apenas usuários logados VÊEM as suas próprias tarefas
taskRoutes.patch('/:id/complete', ensureAuthenticated, taskController.complete);//Apenas usuários logados CONCLUEM tarefas
taskRoutes.get('/managed', ensureManager, taskController.listManagedTasks); //Apenas gestores vêem as tarefas que atribuíram à equipa
taskRoutes.put('/:id', ensureManager, taskController.update); // Apenas gestores podem editar tarefas

export { taskRoutes };