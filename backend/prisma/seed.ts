import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'ti@leveinvestimentos.com.br';
    const plainTextPassword = 'teste123';

    // Verifica se o usuário já existe para não duplicar se rodarmos o script duas vezes
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (!existingUser) {
        // Criptografa a senha antes de salvar
        const passwordHash = await bcrypt.hash(plainTextPassword, 10);

        await prisma.user.create({
            data: {
                fullName: 'Gestor TI Inicial',
                birthDate: new Date('1990-01-01'),
                mobile: '(11) 99999-9999',
                email: email,
                passwordHash: passwordHash,
                address: 'Sede LEVE Investimentos',
                isManager: true,
            },
        });
        console.log(`✅ Usuário gestor inicial criado com sucesso: ${email}`);
    } else {
        console.log(`⚠️ O usuário ${email} já existe no banco de dados.`);
    }
}

main()
    .catch((e) => {
        console.error('Erro ao rodar o seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });