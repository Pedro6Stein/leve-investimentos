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
}