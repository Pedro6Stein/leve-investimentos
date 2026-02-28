import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { ensureManager } from '../middlewares/authMiddleware';

const userRoutes = Router();
const userController = new UserController();

userRoutes.get('/', ensureManager, userController.listAll);
userRoutes.post('/', ensureManager, userController.create);

export { userRoutes };