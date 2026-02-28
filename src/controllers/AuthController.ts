import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
                return;
            }
            const result = await this.authService.login(email, password);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(401).json({ error: 'Credenciais inválidas.' });
        }
    }
}