# ApplyLens

MVP de assistente inteligente de candidaturas: organiza vagas de emprego, extrai
requisitos e prepara você para entrevistas usando IA (Gemini).

---

## Status do projeto

- [x] Autenticação real com Google e GitHub (Auth.js / NextAuth v5)
- [x] Cada usuário vê e edita só as próprias vagas
- [x] Rotas protegidas (proxy.ts + checagem em cada página/rota de API)
- [x] Limite diário de chamadas ao Gemini por usuário (anti-abuso)
- [x] Política de Privacidade e Termos de Uso
- [x] Estrutura pronta para Magic Link por e-mail no futuro (tabela `VerificationToken` já existe)
- [x] Dashboard com busca, filtros (status, local, tecnologia) e alternância cards/tabela
- [x] Estatísticas (funil por status + tecnologias mais pedidas)
- [x] Cadastro de vaga em duas etapas (Analisar → Confirmar → Salvar)
- [x] Análise automática via Gemini (resumo, tecnologias, requisitos, perguntas, checklist)
- [x] Comparação de tecnologias da vaga com suas skills (`lib/skills.ts`)
- [x] Campos de URL, local (remoto/híbrido/presencial), salário e data da candidatura
- [x] Página de detalhes com edição de status e metadados
- [x] Exclusão de vaga
- [x] Persistência local com Prisma + SQLite; suporte a Turso/libSQL em produção
- [x] Endpoint de webhook preparado para integração futura com n8n (desativado por padrão)
- [x] Tratamento de erro em produção (`error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx`)
- [x] Configuração pronta para deploy na Vercel (ver seção "Deploy")
- [ ] Login por Magic Link (e-mail) — estrutura pronta, provider não ativado
- [ ] Checklist com itens marcáveis persistidos (V2)

---

## Stack

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4
- **Autenticação:** Auth.js (NextAuth v5) com login via Google e GitHub
- **Banco de dados:** SQLite local (dev) via `better-sqlite3` / Turso (libSQL) em produção
- **ORM:** Prisma 7 (com driver adapter — obrigatório a partir da v7, ver nota abaixo)
- **IA:** Google Gemini API (`@google/generative-ai`)
- **Hospedagem:** Vercel

---

## Como rodar localmente

### Pré-requisitos

- **Node.js 22 LTS.** Não use Node 24 — o `better-sqlite3` (dependência nativa do
  driver adapter do Prisma) ainda não tem binário pré-compilado para essa versão
  no Windows, e a instalação falha silenciosamente sem build tools configuradas.

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

Preencha `GEMINI_API_KEY` com uma chave gerada em https://aistudio.google.com/apikey
(crie a chave em um **projeto novo**, não reaproveite um projeto antigo).
Deixe `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` **vazias** — em dev local a
app usa o SQLite local automaticamente.

Gere o `AUTH_SECRET`:

```bash
npx auth secret
```

Isso escreve o valor direto no seu `.env`. Depois, crie as credenciais OAuth:

**Google** — em https://console.cloud.google.com/apis/credentials:
1. "Create Credentials" → "OAuth client ID" → tipo "Web application"
2. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Copie o Client ID e o Client Secret para `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`

**GitHub** — em https://github.com/settings/developers → "New OAuth App":
1. Homepage URL: `http://localhost:3000`
2. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copie o Client ID e gere um Client Secret para `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`

### 3. Rodar as migrations

> **Mudança que quebra o banco existente:** esta sprint tornou `Job.userId`
> obrigatório (toda vaga passa a pertencer a um usuário). Um banco local já
> populado de antes não tem esse dado — não dá para simplesmente rodar
> `migrate dev` em cima dele. Apague o banco local e recomece do zero:

```bash
rm -f prisma/dev.db prisma/dev.db-journal
npx prisma migrate dev --name add_authentication
```

O Prisma vai criar as tabelas `User`, `Account`, `Session`,
`VerificationToken` e recriar `Job` já com a coluna `userId`.

### 4. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Abra http://localhost:3000 — você será redirecionado para `/login`.

---

## Nota técnica: Prisma 7 e driver adapters

A partir do Prisma 7, o engine interno em Rust foi removido — **toda conexão
exige um driver adapter** passado no construtor do `PrismaClient`, mesmo para
SQLite local. `lib/prisma.ts` escolhe automaticamente entre dois adapters:

- `@prisma/adapter-better-sqlite3` — usado em dev local (padrão, se `TURSO_DATABASE_URL` não estiver definida)
- `@prisma/adapter-libsql` — usado em produção quando `TURSO_DATABASE_URL` está definida

A URL de conexão local também não fica mais em `schema.prisma`; ela é lida via
`prisma.config.ts` (para o CLI) e via `process.env.DATABASE_URL` diretamente
em `lib/prisma.ts` (para o app).

---

## Deploy

### Por que não dá para simplesmente subir o `dev.db` para a Vercel

O filesystem de funções serverless da Vercel é efêmero e, em muitos casos,
somente leitura fora de `/tmp`. Um arquivo SQLite local não persiste de forma
confiável entre requisições em produção — cada invocação pode rodar numa
instância diferente, sem o mesmo arquivo. Por isso o banco de produção precisa
ser um SQLite **hospedado**: o Turso.

### Passo a passo

**1. Criar o banco no Turso** (grátis, ação manual — você já fez isso pelo
[site do Turso](https://app.turso.tech), o que é totalmente válido; a CLI
oficial deles não é necessária. Guarde a URL de conexão e o token gerados lá
— são os valores de `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` no seu `.env`.)

> Nota: a CLI oficial do Turso (`turso db shell`) **exige WSL no Windows**
> (é uma limitação documentada da própria Turso, não deste projeto). Por isso
> o passo abaixo usa um script Node em vez da CLI — evita esse problema de
> vez, e usa o mesmo `@libsql/client` que a aplicação já depende.

**2. Aplicar as migrations no banco do Turso**

O `prisma migrate dev` não funciona diretamente contra o Turso (limitação
conhecida do Prisma com libSQL remoto — as migrations continuam sendo geradas
localmente, contra o SQLite local, como você já faz). Para aplicar o schema
atual no banco do Turso, com `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` já
preenchidas no seu `.env`, rode:

```bash
npm run migrate:turso
```

Isso executa `scripts/apply-turso-migrations.mjs`, que lê cada
`prisma/migrations/*/migration.sql` em ordem cronológica e aplica statement
por statement direto no banco do Turso, usando `@libsql/client`. É seguro
rodar mais de uma vez — statements que já foram aplicados antes (coluna/tabela
já existente) são detectados e pulados automaticamente.

> **Atenção — mudança que quebra o banco do Turso já existente:** esta
> sprint tornou `Job.userId` obrigatório. Se seu banco do Turso já tem vagas
> de teste, a migration `add_authentication` vai falhar ao tentar adicionar
> essa coluna como obrigatória numa tabela com linhas existentes. Como esses
> dados são só de teste, o caminho mais simples é apagar e recriar o banco no
> Turso antes de rodar `npm run migrate:turso` de novo:
> ```bash
> turso db destroy applylens   # ou apague pelo site app.turso.tech
> turso db create applylens
> turso db show applylens --url
> turso db tokens create applylens
> ```
> (atualize `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` no `.env` e na Vercel se
> a URL ou o token mudarem.)

**3. Criar as credenciais OAuth de produção**

Repita a criação de Google/GitHub OAuth apps (seção "Como rodar localmente"
acima), mas com URLs de produção:
- Google redirect URI: `https://SEU-DOMINIO/api/auth/callback/google`
- GitHub callback URL: `https://SEU-DOMINIO/api/auth/callback/github`

Você pode usar o mesmo app OAuth para dev e produção adicionando as duas
URLs de callback (dev e prod) na mesma configuração — não precisa criar dois
apps separados, tanto o Google quanto o GitHub aceitam múltiplas URLs
autorizadas.

**4. Criar o projeto na Vercel** (ação manual, feita no painel da Vercel)

- Importe o repositório do GitHub em https://vercel.com/new
- Framework preset: Next.js (detectado automaticamente)

**5. Configurar variáveis de ambiente na Vercel**

Em *Project Settings → Environment Variables*, adicione (ambiente
"Production", e "Preview" se quiser testar branches):

| Variável | Valor |
|---|---|
| `TURSO_DATABASE_URL` | a URL obtida no passo 1/2 |
| `TURSO_AUTH_TOKEN` | o token obtido no passo 1/2 |
| `AUTH_SECRET` | gere com `npx auth secret` (use um valor diferente do dev, por segurança) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | do app OAuth criado no passo 3 |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | do app OAuth criado no passo 3 |
| `AUTH_TRUST_HOST` | `true` |
| `GEMINI_API_KEY` | sua chave do Gemini |
| `N8N_WEBHOOK_SECRET` / `N8N_TARGET_USER_ID` | opcional — só se for usar o webhook |

**Não** defina `DATABASE_URL` na Vercel — ela é ignorada quando
`TURSO_DATABASE_URL` está presente, e sua ausência é o que faz `lib/prisma.ts`
escolher o adapter do Turso automaticamente.

**6. Deploy**

Com as variáveis configuradas, qualquer push na branch de produção (ou o botão
"Deploy" no painel) já builda e publica. O `postinstall: prisma generate` no
`package.json` garante que o client do Prisma é gerado a cada deploy.

### Sobre o tempo de execução da análise por IA

A chamada ao Gemini já levou entre 16s e 27s em teste. As rotas
`/api/analyze` e `/api/webhook/n8n` têm `export const maxDuration = 60`
para evitar timeout prematuro (504) nessas chamadas. Os limites exatos de
duração de função variam por plano da Vercel — confira o valor atual em
*Project Settings → Functions* no seu painel antes de assumir que 60s é
suficiente no seu plano.

### Checklist antes de ativar o deploy

- [ ] Banco criado no Turso e migrations aplicadas (passos 1–2)
- [ ] Apps OAuth de produção criados com as URLs de callback corretas (passo 3)
- [ ] Projeto importado na Vercel (passo 4)
- [ ] Variáveis de ambiente configuradas na Vercel (passo 5)
- [ ] `.env` local nunca commitado (já garantido pelo `.gitignore`)

---

## Estrutura do projeto

```
applylens/
  auth.ts                       # Config central do Auth.js (providers, adapter, callbacks)
  proxy.ts                      # Protege rotas (substitui middleware.ts no Next.js 16)
  app/
    page.tsx                    # Dashboard (exige sessão, filtra por usuário)
    login/page.tsx               # Tela de login (Google/GitHub)
    privacidade/page.tsx         # Política de Privacidade
    termos/page.tsx              # Termos de Uso
    nova-vaga/page.tsx          # Cadastro de vaga (Analisar → Confirmar → Salvar)
    vaga/[id]/page.tsx          # Detalhes da vaga (só do dono)
    api/
      auth/[...nextauth]/route.ts  # Handler do Auth.js (login/logout/callback OAuth)
      analyze/route.ts          # Chama o Gemini — exige sessão + rate limit
      jobs/route.ts             # GET (lista do usuário) / POST (cria para o usuário)
      jobs/[id]/route.ts        # GET / PATCH / DELETE — só se for dono da vaga
      webhook/n8n/route.ts      # Endpoint para automações futuras (desativado por padrão)
    error.tsx                   # Erros dentro de rotas
    global-error.tsx            # Erros no próprio layout raiz
    not-found.tsx / loading.tsx
  components/
    ui/                         # Componentes genéricos de apresentação
    job/                        # Componentes do domínio "vaga"
    dashboard/                  # Componentes específicos do Dashboard
    auth/                       # UserMenu (avatar + logout)
    README.md                   # Critério de organização usado acima
  lib/
    prisma.ts                   # Singleton do PrismaClient — escolhe adapter (local/Turso) automaticamente
    gemini.ts                   # Integração com a API do Gemini (inicialização preguiçosa)
    apiAuth.ts                  # requireUser() — checagem de sessão nas rotas de API
    rateLimit.ts                # Limite diário de chamadas ao Gemini por usuário
    jobMapper.ts                # Converte o registro do Prisma para o tipo Job da app
    jobStatus.ts / jobLocation.ts  # Labels e estilos dos enums
    json.ts                     # parseArray/stringifyArray (campos JSON-em-string)
    skills.ts                   # Sua lista de skills (edite manualmente)
    skillGap.ts                 # Compara skills da vaga com lib/skills.ts
  prisma/
    schema.prisma                # inclui User/Account/Session/VerificationToken + Job.userId
    prisma.config.ts            # Config do CLI — sempre aponta para o SQLite local
  scripts/
    apply-turso-migrations.mjs  # Aplica migrations no Turso sem precisar da CLI deles
  types/
    job.ts
    next-auth.d.ts              # Adiciona `id` ao tipo Session.user
```

---

## Decisões de arquitetura (documentadas de propósito)

- **Sessão em banco (`strategy: "database"`), não JWT.** Foi um requisito
  explícito da sprint (ter a tabela `Session` de verdade), e também permite
  invalidar uma sessão específica apagando a linha, se precisar.
- **`proxy.ts` (não `middleware.ts`) para redirecionar não-logados** — nome
  novo obrigatório no Next.js 16, roda em runtime Node.js (Edge foi
  removido para esse arquivo). Isso evita o workaround de "config dividida"
  que a maioria dos tutoriais de Auth.js pedia (não precisamos, porque o
  Prisma Adapter funciona nesse runtime).
- **Proteção em duas camadas, não só no proxy.** O `proxy.ts` só cuida da
  navegação (redireciona página não-autenticada pra `/login`). Toda rota de
  API confere sessão de novo com `requireUser()`, e toda página que busca
  dados do banco confere `auth()` de novo antes de consultar. Depender só do
  proxy é uma prática desaconselhada pela comunidade Next.js — houve um CVE
  em 2025 envolvendo bypass de middleware via header forjado.
- **404, não 403, para vaga de outro usuário.** Se você tentar acessar
  `/vaga/{id}` ou `PATCH /api/jobs/{id}` de uma vaga que não é sua, a
  resposta é "não encontrada", não "sem permissão" — não confirmamos pra
  quem não tem acesso que aquele id existe.
- **Rate limit do Gemini contado no banco, não em memória.** Funções
  serverless não compartilham memória entre instâncias — um contador em
  memória seria inútil em produção na Vercel. `lib/rateLimit.ts` grava o
  contador em `User.geminiCallCount`, resetado a cada 24h.
- **Webhook n8n precisa de `N8N_TARGET_USER_ID`.** Como toda vaga agora
  pertence a um usuário e o webhook é uma chamada servidor-a-servidor (sem
  sessão de navegador), ele precisa saber a quem atribuir a vaga criada.
- **Campos array (`technologies`, `requirements`, `questions`, `checklist`) são
  salvos como JSON-string no SQLite**, não em tabelas relacionadas. Decisão
  temporária do MVP — ver `lib/json.ts`. V2: normalizar em tabelas próprias.
- **Comparação de skills é estática**, não lê currículo automaticamente.
  A lista fica em `lib/skills.ts` e precisa ser mantida manualmente.
- **Checklist é somente leitura.** Persistir o estado "concluído" por item
  exigiria mudar o schema — fora do escopo atual.
- **Dois drivers de banco, selecionados por variável de ambiente**, em vez de
  duas branches de deploy separadas — mantém dev local rápido/gratuito sem
  depender de rede, e produção compatível com serverless, com uma única base
  de código.
