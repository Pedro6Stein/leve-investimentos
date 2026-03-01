# 🚀 LEVE Ops - Sistema de Gestão Operacional

Este repositório contém a solução desenvolvida para o desafio técnico da **LEVE Investimentos**. O sistema é uma plataforma completa para gestão operacional, focado em gerenciar equipes (gestores e subordinados) e o ciclo de vida de tarefas, com notificações automatizadas por e-mail.

## 🏗️ Arquitetura do Projeto (Monorepo)

O projeto foi estruturado no formato **Monorepo** para manter o código organizado e facilitar a avaliação:

- 📁 **/backend**: API RESTful construída com **Node.js, TypeScript e Express**.
- 📁 **/frontend**: Interface de usuário (UI) consumindo a API.

## ✨ Principais Funcionalidades (Back-end)

- **Autenticação Segura:** Login baseado em tokens **JWT** com senhas criptografadas via **Bcrypt**.
- **Controle de Acesso (RBAC):** Rotas protegidas por middlewares que diferenciam "Gestores" de "Subordinados".
- **Gestão de Tarefas:** Atribuição de demandas com prazo limite de execução.
- **Notificações Inteligentes:** - Disparo de e-mail ao subordinado quando uma tarefa é atribuída (Gestor em Cópia).
  - Disparo de e-mail ao gestor quando a tarefa é concluída.
- **Validação Rigorosa:** Uso do **Zod** para validar dados na entrada da API.

---

## 🛠️ Como Executar o Projeto Localmente

### 1. Pré-requisitos
- **Node.js** (v18 ou superior)
- **SQL Server** (Pode ser uma instância local na sua máquina ou via Docker).

### 2. Clonando o Repositório
```bash
git clone https://github.com/Pedro6Stein/leve-investimentos.git
cd leve-investimentos/backend
3. Configuração das Variáveis de Ambiente (.env)
Como este é um projeto de avaliação técnica e o banco de dados é executado localmente, as credenciais foram deixadas explícitas para facilitar o setup. Crie um arquivo chamado .env na raiz da pasta backend/ e cole o conteúdo abaixo:

Fragmento do código
DATABASE_URL="sqlserver://localhost:1433;database=LeveDB;user=sa;password=LevePassword123!;encrypt=true;trustServerCertificate=true"
JWT_SECRET="super_secret_jwt_key_leve_2026"
PORT=3333
4. Configuração do Banco de Dados (Infraestrutura)
Você tem duas opções para o banco de dados SQL Server:

Opção A: Usando o Docker (Recomendado/Mais rápido)
O projeto inclui um arquivo docker-compose.yml já configurado com a senha correspondente ao .env. Basta rodar:

Bash
docker-compose up -d
Opção B: Usando o seu SQL Server Local
Se não quiser usar o Docker, basta garantir que o seu SQL Server esteja rodando e usar a mesma string de conexão fornecida no passo 3.

5. Instalação, Modelagem e População do Banco
A modelagem e a população do banco de dados são gerenciadas de forma automatizada e segura pelo Prisma ORM.

No terminal, dentro da pasta /backend, execute sequencialmente:

Bash
# Instala todas as dependências do projeto
npm install

# Cria as tabelas e a modelagem do banco de dados (Equivalente ao Script de Modelagem)
npx prisma migrate dev --name init

# Popula o banco com os dados iniciais exigidos (Equivalente ao Script de População)
npm run seed
6. Iniciando a Aplicação
Com o banco pronto, inicie o servidor:

Bash
npm run dev
A API estará escutando as requisições em http://localhost:3333.

🔑 Credenciais de Acesso Inicial
Após rodar o comando de população (npm run seed), utilize as seguintes credenciais no Frontend ou no Insomnia/Postman para realizar o primeiro login no sistema como Gestor:

E-mail: ti@leveinvestimentos.com.br

Senha: teste123

Desenvolvido com ☕ e dedicação por Pedro Stein