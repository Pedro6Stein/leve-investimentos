import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { ensureManager, ensureAuthenticated } from '../middlewares/authMiddleware';

const userRoutes = Router();
const userController = new UserController();

userRoutes.get('/', ensureManager, userController.listAll);
userRoutes.post('/', ensureManager, userController.create);
userRoutes.get('/me', ensureAuthenticated, userController.me);

export { userRoutes };