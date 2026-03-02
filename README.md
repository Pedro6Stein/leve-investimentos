```markdown
# ⚡ LEVE Ops — Sistema de Gestão Operacional

![Banner do Projeto](./docs/banner.png)
> Projeto desenvolvido como Desafio Técnico para a vaga de Desenvolvedor na **LEVE Investimentos**.

O **LEVE Ops** é um sistema web interno focado na gestão de tarefas para o setor operacional. Ele permite que gestores atribuam tarefas, acompanhem prazos e automatizem o fluxo de trabalho com notificações em tempo real via e-mail.

---

## 🚀 Funcionalidades Principais (O que foi entregue)

- **Autenticação Segura:** Login via JWT com controle estrito de rotas e expiração de sessão.
- **Controle de Acesso (RBAC):** Separação total de privilégios entre *Gestores* (podem criar usuários e tarefas) e *Colaboradores* (apenas visualizam e concluem suas demandas).
- **Gestão de Tarefas Completa:** Criação, edição e acompanhamento de status com validação de datas (não permite datas retroativas).
- **Notificações Automáticas (E-mail):** Integração com Nodemailer para disparo de e-mails transacionais em eventos chave (Nova tarefa, Tarefa editada, Tarefa concluída).
- **Dashboard Dinâmico:** Interface reativa construída com UIKit, com cards de estatísticas que atualizam em tempo real.
- **Processamento de Imagens:** Upload de foto de perfil com compressão automática em Base64 no lado do cliente.

---

## 🛠️ Decisões Arquiteturais e Stack Tecnológica

O projeto foi dividido em uma arquitetura limpa (Backend RESTful + Frontend Single Page App), focando em **Clean Code** e princípios **SOLID**.

**Back-end:**
- **Node.js + Express + TypeScript:** Estrutura base da API, separada em *Controllers*, *Services* e *Routes*.
- **Prisma ORM:** Abstração segura e tipada para o banco de dados.
- **SQL Server (Docker):** Banco de dados relacional robusto rodando em container para garantir padronização do ambiente.
- **Zod:** Validação rigorosa dos dados de entrada nas rotas.
- **JWT & Bcrypt:** Segurança de dados e senhas.

**Front-end:**
- **TypeScript Vanilla:** Escolhido para demonstrar domínio real da linguagem e do DOM, criando *wrappers* genéricos (`HttpClient`, `DataGrid`) sem depender de frameworks pesados.
- **UIKit CSS:** Framework exigido nos requisitos, customizado com variáveis CSS para criar um "Design System" com a paleta institucional (Navy & Gold).

---

## 📸 Fluxo do Sistema (Screenshots)

### 1. Autenticação e Redirecionamento
![Tela de Login](./docs/login.png)

### 2. Visão do Gestor (Dashboard & Stats)
*Gestores têm acesso a estatísticas da equipe, criação de usuários e edição de tarefas.*
![Dashboard Gestor](./docs/dashboard-gestor.png)

### 3. Visão do Colaborador
*Visão limpa focada apenas na execução e conclusão das tarefas.*
![Dashboard Colaborador](./docs/dashboard-colaborador.png)

### 4. Notificações por E-mail (Extra entregue!)
*Exemplo de e-mail disparado via SMTP quando uma tarefa é atribuída ou finalizada.*
![Exemplos de E-mail](./docs/email-notifications.png)

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (v18+)
- **Git**
- **Docker e Docker Compose** (Recomendado para o banco de dados)

### Passo 1: Clonar o Repositório
```bash
git clone [https://github.com/SEU_USUARIO/leve-investimentos.git](https://github.com/SEU_USUARIO/leve-investimentos.git)
cd leve-investimentos

```

### Passo 2: Configurar o Banco de Dados (Docker - ⭐ BÔNUS)

*Para garantir a padronização e facilitar a execução, a infraestrutura do SQL Server foi dockerizada como um diferencial técnico do projeto.*

Levante o container do SQL Server em segundo plano executando:

```bash
docker compose up -d

```

*Aguarde cerca de 30 segundos para o container realizar o healthcheck e ficar pronto para conexões.*

### Passo 3: Configurar as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (onde fica o `package.json`) com a seguinte estrutura:

```env
DATABASE_URL="sqlserver://localhost:1433;database=LeveDB;user=sa;password=LevePassword123!;encrypt=true;trustServerCertificate=true"
JWT_SECRET="super_secret_jwt_key_leve_2026"
PORT=3333
NODE_ENV="production"
EMAIL_USER="enviataskleve@gmail.com"
EMAIL_PASS= (A senha foi enviada em anexo no email, por favor verificar para o email funcionar)

```

### Passo 4: Instalar e Iniciar o Back-end

Com o banco rodando e o `.env` configurado, instale as dependências, rode as migrações e popule o banco inicial:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed

```

Em seguida, compile e inicie a API:

```bash
npm run build
npm start

```

*(Para ambiente de desenvolvimento, utilize `npm run dev`).*

### Passo 5: Rodar o Front-end

Abra um novo terminal e compile o TypeScript:

```bash
npx tsc -w

```

Sirva os arquivos estáticos na raiz do projeto (utilizando a extensão Live Server do VS Code, ou rodando um pacote como `serve`):

```bash
npx serve . -p 3000

```

*Acesse o sistema em `http://localhost:3000`.*

---

## 🔑 Credenciais Padrão (Seed)

Para avaliar o sistema, utilize o usuário gestor criado automaticamente pelo comando `seed`:

* **E-mail:** `ti@leveinvestimentos.com.br`
* **Senha:** `teste123`

---

*Desenvolvido com dedicação por Pedro Stein.*

```
