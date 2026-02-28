import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export class UserController {
    listAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    mobile: true,
                    isManager: true,
                    createdAt: true,
                },
            });

            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: 'Erro interno ao buscar usuários.' });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const { fullName, birthDate, mobile, email, password, address, isManager } = req.body;

            if (!email || !password || !fullName) {
                res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
                return;
            }
            
            const bcrypt = require('bcrypt');
            const passwordHash = await bcrypt.hash(password, 10);

            const newUser = await prisma.user.create({
                data: {
                    fullName,
                    birthDate: new Date(birthDate),
                    mobile,
                    email,
                    passwordHash,
                    address,
                    isManager: isManager || false,
                },
                select: { id: true, email: true, fullName: true }
            });

            res.status(201).json(newUser);
        } catch (error: any) {
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
                return;
            }
            res.status(500).json({ error: 'Erro ao criar usuário.' });
        }
    };
}