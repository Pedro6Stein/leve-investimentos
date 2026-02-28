import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { taskRoutes } from './routes/taskRoutes';
const app = express();

app.use(cors());
app.use(express.json());

// Rota de Autenticação
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/tasks', taskRoutes);

export { app };