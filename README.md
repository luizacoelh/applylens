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
- [x] Persistência local com Prisma + SQLite
- [x] Endpoint de webhook preparado para integração futura com n8n (desativado por padrão)
- [ ] Checklist com itens marcáveis persistidos (V2)
- [ ] Deploy em produção (ver seção "Deploy" abaixo — bloqueado por SQLite não ser adequado para Vercel)
- [ ] Autenticação / multiusuário (fora do escopo do MVP)

---

## Stack

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4
- **Banco de dados:** SQLite (via `better-sqlite3`)
- **ORM:** Prisma 7 (com driver adapter — obrigatório a partir da v7, ver nota abaixo)
- **IA:** Google Gemini API (`@google/generative-ai`)

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
SQLite local. Por isso `lib/prisma.ts` usa `@prisma/adapter-better-sqlite3` em
vez de `new PrismaClient()` puro. A URL de conexão também não fica mais em
`schema.prisma`; ela é lida via `prisma.config.ts` (para o CLI) e via
`process.env.DATABASE_URL` diretamente em `lib/prisma.ts` (para o app).

---

## Deploy

**Atenção antes de fazer deploy na Vercel:** o filesystem de funções serverless
da Vercel é efêmero e, em muitos casos, somente leitura fora de `/tmp` — um
arquivo SQLite local (`dev.db`) **não persiste de forma confiável** entre
requisições em produção. Isso não afeta o uso local, só o deploy.

Caminho recomendado para deploy, mantendo tudo gratuito:

1. Criar um banco no [Turso](https://turso.tech) (SQLite hospedado, tier gratuito)
2. Trocar `@prisma/adapter-better-sqlite3` por `@prisma/adapter-libsql` em `lib/prisma.ts`
3. Apontar `DATABASE_URL` para a URL do Turso nas variáveis de ambiente da Vercel
4. Rodar `npx prisma migrate deploy` apontando para o banco do Turso

Essa migração de driver não foi feita ainda — é o próximo passo antes de publicar
o projeto (ver `ROADMAP.md`).

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
    error.tsx / not-found.tsx / loading.tsx
  components/                   # Componentes de apresentação e client components
  lib/
    prisma.ts                   # Singleton do PrismaClient com driver adapter
    gemini.ts                   # Integração com a API do Gemini
    jobMapper.ts                # Converte o registro do Prisma para o tipo Job da app
    jobStatus.ts / jobLocation.ts  # Labels e estilos dos enums
    json.ts                     # parseArray/stringifyArray (campos JSON-em-string)
    skills.ts                   # Sua lista de skills (edite manualmente)
    skillGap.ts                 # Compara skills da vaga com lib/skills.ts
  prisma/
    schema.prisma
  types/
    job.ts
```

---

## Decisões de arquitetura (documentadas de propósito)

- **Campos array (`technologies`, `requirements`, `questions`, `checklist`) são
  salvos como JSON-string no SQLite**, não em tabelas relacionadas. Decisão
  temporária do MVP — ver `lib/json.ts`. V2: normalizar em tabelas próprias.
- **Comparação de skills é estática**, não lida currículo automaticamente.
  A lista fica em `lib/skills.ts` e precisa ser mantida manualmente.
- **Checklist é somente leitura.** Persistir o estado "concluído" por item
  exigiria mudar o schema — fora do escopo atual.
