import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

const createUserSchema = z.object({
    fullName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de nascimento inválida.'),
    landline: z.string().optional(),
    mobile: z.string().min(9, 'O telemóvel/celular deve ter pelo menos 9 dígitos.'),
    email: z.string().email('Formato de e-mail inválido.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    address: z.string().min(5, 'O endereço é obrigatório e deve ser válido.'),
    photo: z.string().optional(),
    isManager: z.boolean().optional().default(false),
});

export class UserController {
    listAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    mobile: true,
                    landline: true,
                    address: true,
                    birthDate: true,
                    isManager: true,
                    createdAt: true,
                    photo: true,
                },
            });

            res.status(200).json(users);
        } catch {
            res.status(500).json({ error: 'Erro interno ao buscar usuários.' });
        }
    };
    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const validation = createUserSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({
                    error: 'Dados de cadastro inválidos',
                    details: validation.error.format()
                });
                return;
            }
            const { fullName, birthDate, landline, mobile, email, password, address, photo, isManager } = validation.data;

            // Criptografa a senha e salva no banco
            const passwordHash = await bcrypt.hash(password, 10);

            const newUser = await prisma.user.create({
                data: {
                    fullName,
                    birthDate: new Date(birthDate),
                    landline,
                    mobile,
                    email,
                    passwordHash,
                    address,
                    photo,
                    isManager, // O Zod já aplica o default(false) se não for enviado
                },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    landline: true,
                    mobile: true,
                    address: true
                }
            });

            res.status(201).json(newUser);
        } catch (error: any) {
            // Tratamento específico para e-mail duplicado no Prisma
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
                return;
            }
            console.error("ERRO REAL NA CRIAÇÃO DO USUÁRIO:", error);
            res.status(500).json({ error: 'Erro interno ao criar utilizador.' });
        }
    };
    me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Token inválido ou ausente.' });
                return;
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    mobile: true,
                    landline: true,
                    address: true,
                    birthDate: true,
                    isManager: true,
                    createdAt: true,
                    photo: true,
                },
            });

            if (!user) {
                res.status(404).json({ error: 'Usuário não encontrado.' });
                return;
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Erro interno ao buscar perfil.' });
        }
    };
}