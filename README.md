# ApplyLens

MVP de assistente inteligente de candidaturas: organiza vagas de emprego, extrai
requisitos e prepara você para entrevistas usando IA (Gemini).

---

## Status do projeto

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
- [ ] Checklist com itens marcáveis persistidos (V2)
- [ ] Autenticação / multiusuário (fora do escopo do MVP)

---

## Stack

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4
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

### 3. Rodar as migrations

```bash
npx prisma migrate dev
```

### 4. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Abra http://localhost:3000.

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

**1. Criar a conta e o banco no Turso** (grátis, ação manual — feita fora deste repositório)

```bash
# instalar a CLI do Turso (uma vez)
curl -sSfL https://get.tur.so/install.sh | bash

# login
turso auth login

# criar o banco
turso db create applylens

# pegar a URL de conexão
turso db show applylens --url

# gerar um token de autenticação
turso db tokens create applylens
```

Guarde a URL (algo como `libsql://applylens-seuuser.turso.io`) e o token — são
os valores de `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`.

**2. Aplicar as migrations no banco do Turso**

O `prisma migrate dev` não funciona diretamente contra o Turso (limitação
conhecida do Prisma com libSQL remoto — as migrations continuam sendo geradas
localmente, contra o SQLite local, como você já faz). Para aplicar o schema
atual no banco do Turso, rode cada arquivo de migration existente em
`prisma/migrations/*/migration.sql`, em ordem, direto pela CLI do Turso:

```bash
turso db shell applylens < prisma/migrations/20260713194835_init/migration.sql
turso db shell applylens < prisma/migrations/20260713214601_init/migration.sql
turso db shell applylens < prisma/migrations/20260713220208_add_status_enum/migration.sql
turso db shell applylens < prisma/migrations/20260714221547_add_job_metadata/migration.sql
```

(a lista exata de pastas pode mudar — rode `ls prisma/migrations` para
conferir a ordem atual antes de aplicar. É a mesma ordem cronológica dos nomes
das pastas.)

**3. Criar o projeto na Vercel** (ação manual, feita no painel da Vercel)

- Importe o repositório do GitHub em https://vercel.com/new
- Framework preset: Next.js (detectado automaticamente)

**4. Configurar variáveis de ambiente na Vercel**

Em *Project Settings → Environment Variables*, adicione (ambiente
"Production", e "Preview" se quiser testar branches):

| Variável | Valor |
|---|---|
| `TURSO_DATABASE_URL` | a URL obtida no passo 1 |
| `TURSO_AUTH_TOKEN` | o token obtido no passo 1 |
| `GEMINI_API_KEY` | sua chave do Gemini |
| `N8N_WEBHOOK_SECRET` | opcional — só se for usar o webhook |

**Não** defina `DATABASE_URL` na Vercel — ela é ignorada quando
`TURSO_DATABASE_URL` está presente, e sua ausência é o que faz `lib/prisma.ts`
escolher o adapter do Turso automaticamente.

**5. Deploy**

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
- [ ] Projeto importado na Vercel (passo 3)
- [ ] Variáveis de ambiente configuradas na Vercel (passo 4)
- [ ] `.env` local nunca commitado (já garantido pelo `.gitignore`)

---

## Estrutura do projeto

```
applylens/
  app/
    page.tsx                    # Dashboard
    nova-vaga/page.tsx          # Cadastro de vaga (Analisar → Confirmar → Salvar)
    vaga/[id]/page.tsx          # Detalhes da vaga
    api/
      analyze/route.ts          # Chama o Gemini, não persiste
      jobs/route.ts             # GET (lista) / POST (cria)
      jobs/[id]/route.ts        # GET / PATCH / DELETE de uma vaga
      webhook/n8n/route.ts      # Endpoint para automações futuras (desativado por padrão)
    error.tsx                   # Erros dentro de rotas
    global-error.tsx            # Erros no próprio layout raiz
    not-found.tsx / loading.tsx
  components/
    ui/                         # Componentes genéricos de apresentação
    job/                        # Componentes do domínio "vaga"
    dashboard/                  # Componentes específicos do Dashboard
    README.md                   # Critério de organização usado acima
  lib/
    prisma.ts                   # Singleton do PrismaClient — escolhe adapter (local/Turso) automaticamente
    gemini.ts                   # Integração com a API do Gemini (inicialização preguiçosa)
    jobMapper.ts                # Converte o registro do Prisma para o tipo Job da app
    jobStatus.ts / jobLocation.ts  # Labels e estilos dos enums
    json.ts                     # parseArray/stringifyArray (campos JSON-em-string)
    skills.ts                   # Sua lista de skills (edite manualmente)
    skillGap.ts                 # Compara skills da vaga com lib/skills.ts
  prisma/
    schema.prisma
    prisma.config.ts            # Config do CLI — sempre aponta para o SQLite local
  types/
    job.ts
```

---

## Decisões de arquitetura (documentadas de propósito)

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
