import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

export class AuthService {
    async login(email: string, passwordText: string) {

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error('Credenciais inválidas');
        }


        const isPasswordValid = await bcrypt.compare(passwordText, user.passwordHash);

        if (!isPasswordValid) {
            throw new Error('Credenciais inválidas');
        }


        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                isManager: user.isManager
            },
            secret,
            { expiresIn: '8h' }
        );


        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                isManager: user.isManager,
            },
            token,
        };
    }
}