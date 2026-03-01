import nodemailer from 'nodemailer';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    // Requisito 1: O subordinado recebe um e-mail sempre que uma nova tarefa for atribuída a ele.
    async sendTaskAssignedEmail(to: string, cc: string, subordinateName: string, description: string) {
        try {
            await this.transporter.sendMail({
                from: `"LEVE Investimentos" <${process.env.EMAIL_USER}>`,
                to,
                cc,
                subject: 'LEVE - Nova Tarefa Atribuída',
                text: `Olá ${subordinateName},\n\nUma nova tarefa foi atribuída a você:\n\n"${description}"\n\nAcesse o sistema para mais detalhes.`,
            });
            console.log(`📧 E-mail de Nova Tarefa enviado para: ${to} (CC: ${cc})`);
        } catch (error) {
            console.error("Erro ao enviar e-mail de nova tarefa:", error);
        }
    }

    // Requisito 2: O gestor recebe um e-mail quando a tarefa for finalizada pelo usuário responsável.
    async sendTaskCompletedEmail(to: string, managerName: string, subordinateName: string, description: string) {
        try {
            await this.transporter.sendMail({
                from: `"LEVE Investimentos" <${process.env.EMAIL_USER}>`,
                to,
                subject: 'LEVE - Tarefa Concluída',
                text: `Olá ${managerName},\n\nO colaborador ${subordinateName} concluiu a seguinte tarefa:\n\n"${description}"\n\nAcesse o sistema para validar.`,
            });
            console.log(`📧 E-mail de Tarefa Concluída enviado com sucesso para: ${to}`);
        } catch (error) {
            console.error("Erro ao enviar e-mail de tarefa concluída:", error);
        }
    }

    async sendTaskUpdatedEmail(to: string, cc: string, subordinateName: string, description: string) {
        try {
            await this.transporter.sendMail({
                from: `"LEVE Investimentos" <${process.env.EMAIL_USER}>`,
                to,
                cc,
                subject: 'LEVE - Tarefa Atualizada',
                text: `Olá ${subordinateName},\n\nUma tarefa atribuída a você foi atualizada:\n\n"${description}"\n\nAcesse o sistema para mais detalhes.`,
            });
            console.log(`📧 E-mail de Tarefa Atualizada enviado para: ${to} (CC: ${cc})`);
        } catch (error) {
            console.error("Erro ao enviar e-mail de tarefa atualizada:", error);
        }
    }
}