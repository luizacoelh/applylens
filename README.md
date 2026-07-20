# ApplyLens

## Descrição

ApplyLens é uma ferramenta de organização de candidaturas de emprego que usa
IA para reduzir o trabalho manual de acompanhar processos seletivos. Ao colar
a descrição de uma vaga, a aplicação extrai automaticamente resumo,
tecnologias exigidas, requisitos, perguntas prováveis de entrevista e um
checklist de preparação — e compara essas tecnologias com o perfil de skills
do próprio usuário, mostrando de forma objetiva o que já é dominado e o que
precisa ser estudado antes da entrevista.

O problema que resolve: candidatos que aplicam para várias vagas em paralelo
perdem tempo reescrevendo anotações sobre cada processo e raramente têm uma
visão consolidada do próprio funil (quantas aplicações viraram entrevista,
quantas viraram oferta). O ApplyLens centraliza isso num só lugar, por
usuário, com dados isolados e persistidos.

## Funcionalidades

- Login via Google e GitHub (OAuth), com sessão persistida em banco
- Cadastro de vaga em duas etapas: colar a descrição, IA analisa, usuário
  confirma antes de salvar
- Extração automática por IA: resumo, tecnologias, requisitos, perguntas de
  entrevista, checklist de preparação
- Perfil de usuário (objetivo profissional, área de interesse, nível de
  experiência, skills) usado para comparar automaticamente com cada vaga
- Onboarding: usuário sem perfil é levado a completá-lo no primeiro acesso
- Dashboard com busca, filtros (status, local, tecnologia), alternância entre
  cards e tabela, e métricas (total de candidaturas, entrevistas, ofertas,
  taxa de conversão, tecnologias mais pedidas)
- Exportação das próprias vagas em CSV
- Edição de status, URL, local, salário e data da candidatura por vaga
- Isolamento total de dados por usuário — nenhuma consulta ao banco retorna
  registros de outro usuário
- Limite diário de uso da IA por usuário, limite adicional por IP, e limite
  de tamanho de entrada — proteção contra abuso da API do Gemini
- Registro de uso da IA por usuário (tabela `AiUsage`), preparado para um
  futuro painel de consumo
- Endpoint de webhook para automação futura via n8n (desativado por padrão)

## Tecnologias utilizadas

**Frontend**
- Next.js 16 (App Router, Server Components)
- TypeScript
- Tailwind CSS v4

**Backend / dados**
- Next.js Route Handlers (API)
- Prisma ORM 7 (com driver adapters — SQLite local via `better-sqlite3`,
  Turso/libSQL em produção)
- Auth.js (NextAuth v5) com `@auth/prisma-adapter`

**IA**
- Google Gemini API (`@google/generative-ai`)

**Infraestrutura**
- Vercel (hospedagem e deploy)
- Turso (SQLite hospedado, compatível com ambiente serverless)

## Arquitetura

Visão de alto nível abaixo; estrutura de pastas completa e decisões técnicas
documentadas em [`ARCHITECTURE.md`](./ARCHITECTURE.md).

```
Frontend (Server/Client Components)
        │
        ▼
API Routes (Next.js Route Handlers)
        │
        ├── Auth.js  → autentica a sessão, isola cada request por usuário
        │
        ├── Prisma   → acesso ao banco, sempre filtrado por userId
        │       │
        │       ▼
        │     Turso (produção) / SQLite local (dev)
        │
        └── Gemini API → análise da vaga (resumo, tecnologias, requisitos...)
```

Duas decisões estruturais valem registro:

- **`proxy.ts`, não `middleware.ts`.** No Next.js 16 esse arquivo foi
  renomeado e passou a rodar só em runtime Node.js (Edge foi removido) — o
  que permite usar o Prisma Adapter direto na proteção de rotas, sem a
  separação de config que tutoriais mais antigos de Auth.js pedem.
- **Proteção em duas camadas.** O `proxy.ts` cuida só da navegação
  (redireciona página não-autenticada para `/login`). Toda rota de API
  confere sessão de novo com `requireUser()`, e toda página que consulta o
  banco confere `auth()` de novo antes da query. Depender só do proxy para
  segurança é desaconselhado pela comunidade Next.js (houve um CVE em 2025
  envolvendo bypass de middleware via header forjado).

## Screenshots

_(espaço reservado — adicionar capturas do Dashboard, da tela de análise de
vaga e do perfil antes de publicar o repositório)_

## Como executar localmente

### Pré-requisitos

- **Node.js 22 LTS.** Não use Node 24 — o `better-sqlite3` (dependência
  nativa do driver adapter do Prisma usado em dev local) não tem binário
  pré-compilado para essa versão no Windows.

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/luizacoelh/applylens.git
cd applylens
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Preencha:

- `GEMINI_API_KEY` — gerada em https://aistudio.google.com/apikey (crie a
  chave em um projeto novo)
- `AUTH_SECRET` — gere com `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — app OAuth criado em
  https://console.cloud.google.com/apis/credentials, com redirect URI
  `http://localhost:3000/api/auth/callback/google`
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — app OAuth criado em
  https://github.com/settings/developers, com callback URL
  `http://localhost:3000/api/auth/callback/github`

Deixe `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` vazias — em dev local a app
usa SQLite local automaticamente (ver `lib/prisma.ts`).

### 3. Banco de dados

```bash
npx prisma migrate dev
```

### 4. Rodar

```bash
npm run dev
```

Abra http://localhost:3000 — você será redirecionado para `/login`.

## Deploy

Passo a passo completo (Turso, apps OAuth de produção, variáveis de ambiente
na Vercel) documentado em [`DEPLOY.md`](./DEPLOY.md), para manter este README
focado em visão geral do projeto.

Resumo: banco de produção no Turso (SQLite não persiste em funções
serverless), migrations aplicadas via `npm run migrate:turso` (script próprio
em `scripts/`, sem depender da CLI do Turso — que exige WSL no Windows), e
deploy contínuo pela integração Git da Vercel.

## Segurança

- **Autenticação**: OAuth via Google e GitHub (Auth.js v5), sessão
  persistida em banco (`strategy: "database"`), sem senhas armazenadas pela
  aplicação.
- **Isolamento por usuário**: toda tabela de dados (`Job`, `UserProfile`,
  `AiUsage`) tem `userId` obrigatório, e toda query no código filtra por
  `session.user.id`. Acesso a um recurso de outro usuário responde **404**,
  não 403 — não confirmamos a existência do recurso para quem não tem acesso.
- **Proteção de rotas em duas camadas**: `proxy.ts` para navegação +
  checagem de sessão repetida em cada rota de API e Server Component (ver
  seção Arquitetura).
- **Controle de uso da IA**:
  - Limite de tamanho de entrada (8000 caracteres) antes de qualquer
    chamada ao Gemini, validado no cliente e revalidado no servidor.
  - Limite diário por usuário (20 análises/dia), contado no banco — não em
    memória, porque funções serverless não compartilham memória entre
    instâncias.
  - Limite adicional por IP (30 análises/hora, somando todas as contas que
    usarem aquele IP), para dificultar abuso via múltiplas contas. Reaproveita
    a tabela `AiUsage` já existente para o registro de consumo, em vez de
    criar uma tabela nova só para isso.
  - Cada chamada é registrada em `AiUsage` (usuário, ação, IP, data) —
    preparado para um futuro painel de consumo, ainda não implementado.
- **Variáveis sensíveis** nunca commitadas (`.env` no `.gitignore`); `.env.example`
  documenta todas as chaves necessárias sem valores reais.

## Roadmap

Mantido em [`ROADMAP.md`](./ROADMAP.md).
