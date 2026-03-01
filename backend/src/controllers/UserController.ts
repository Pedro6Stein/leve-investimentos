import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcrypt';

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
            const { fullName, birthDate, landline, mobile, email, password, address, photo, isManager } = req.body;
            // Verifica se algum campo obrigatório veio vazio, nulo ou indefinido
            if (!fullName || !birthDate || !mobile || !email || !password || !address) {
                res.status(400).json({ 
                    error: 'Campos obrigatórios ausentes. Certifique-se de enviar: fullName, birthDate, mobile, email, password e address.' 
                });
                return;
            }

            //const bcrypt = require('bcrypt');
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
                    isManager: isManager || false,
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
            // Correção do erro de copy-paste no log
            console.error("ERRO REAL NA CRIAÇÃO DO USUÁRIO:", error);
            res.status(500).json({ error: 'Erro interno ao criar utilizador.' });
        }
    };
}