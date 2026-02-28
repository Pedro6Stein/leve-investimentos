import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/authRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Rota de Autenticação
app.use('/api/auth', authRoutes);

export { app };