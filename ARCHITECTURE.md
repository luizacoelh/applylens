# Arquitetura — ApplyLens

Detalhe de estrutura de pastas e decisões técnicas. Visão geral do produto
fica no [`README.md`](./README.md); passo a passo de deploy no
[`DEPLOY.md`](./DEPLOY.md).

## Estrutura do projeto

```
applylens/
  auth.ts                       # Config central do Auth.js (providers, adapter, callbacks)
  proxy.ts                      # Protege rotas (substitui middleware.ts no Next.js 16)
  app/
    page.tsx                    # Dashboard (exige sessão + perfil, filtra por usuário)
    login/page.tsx               # Tela de login (Google/GitHub)
    perfil/page.tsx              # Perfil do usuário (onboarding + edição)
    privacidade/page.tsx         # Política de Privacidade
    termos/page.tsx              # Termos de Uso
    nova-vaga/page.tsx          # Cadastro de vaga (Analisar → Confirmar → Salvar)
    vaga/[id]/page.tsx          # Detalhes da vaga (só do dono)
    api/
      auth/[...nextauth]/route.ts  # Handler do Auth.js (login/logout/callback OAuth)
      analyze/route.ts          # Chama o Gemini — sessão + limite de tamanho + rate limit (usuário e IP)
      profile/route.ts          # GET / PUT (upsert) do perfil do usuário logado
      jobs/route.ts             # GET (lista do usuário) / POST (cria para o usuário)
      jobs/[id]/route.ts        # GET / PATCH / DELETE — só se for dono da vaga
      jobs/export/route.ts      # Exporta as vagas do usuário logado em CSV
      webhook/n8n/route.ts      # Endpoint para automações futuras (desativado por padrão)
    error.tsx                   # Erros dentro de rotas
    global-error.tsx            # Erros no próprio layout raiz
    not-found.tsx / loading.tsx
  components/
    ui/                         # Componentes genéricos de apresentação
    job/                        # Componentes do domínio "vaga"
    dashboard/                  # Componentes específicos do Dashboard
    auth/                       # UserMenu (avatar + link de perfil + logout)
    profile/                    # ProfileForm
    README.md                   # Critério de organização usado acima
  lib/
    prisma.ts                   # Singleton do PrismaClient — escolhe adapter (local/Turso) automaticamente
    gemini.ts                   # Integração com a API do Gemini (inicialização preguiçosa)
    apiAuth.ts                  # requireUser() — checagem de sessão nas rotas de API
    rateLimit.ts                # Limite diário de chamadas ao Gemini por usuário
    ipRateLimit.ts              # Limite adicional de chamadas ao Gemini por IP
    aiUsage.ts                  # Registro de cada chamada à IA (tabela AiUsage)
    jobMapper.ts                # Converte o registro do Prisma para o tipo Job da app
    jobStatus.ts / jobLocation.ts / experienceLevel.ts  # Labels e estilos dos enums
    json.ts                     # parseArray/stringifyArray (campos JSON-em-string)
    skillGap.ts                 # Compara tecnologias da vaga com as skills do UserProfile
  prisma/
    schema.prisma                # User/Account/Session/VerificationToken (Auth.js) + UserProfile + AiUsage + Job
    prisma.config.ts            # Config do CLI — sempre aponta para o SQLite local
  scripts/
    apply-turso-migrations.mjs  # Aplica migrations no Turso sem precisar da CLI deles
    fix-turso-job-table.mjs     # Referência: como corrigir uma tabela específica sem apagar as demais
  types/
    job.ts / profile.ts
    next-auth.d.ts              # Adiciona `id` ao tipo Session.user
```

## Decisões documentadas de propósito

- **Sessão em banco (`strategy: "database"`), não JWT.** Permite invalidar
  uma sessão específica apagando a linha, se precisar, e mantém a tabela
  `Session` como fonte de verdade.
- **`proxy.ts`, não `middleware.ts`.** Nome novo obrigatório no Next.js 16,
  roda em runtime Node.js — evita o workaround de "config dividida" que a
  maioria dos tutoriais de Auth.js pede para viabilizar Edge runtime.
- **Proteção em duas camadas.** `proxy.ts` só cuida de navegação; toda rota
  de API e todo Server Component que consulta o banco confere `auth()` de
  novo. Depender só do proxy é desaconselhado pela comunidade Next.js (CVE de
  2025 envolvendo bypass de middleware via header forjado).
- **404, não 403, para recurso de outro usuário.** Não confirmamos para quem
  não tem acesso que aquele id existe.
- **Rate limit (usuário e IP) contado no banco, não em memória.** Funções
  serverless não compartilham memória entre instâncias — um contador em
  memória seria inútil em produção na Vercel.
- **Rate limit por IP reaproveita a tabela `AiUsage`.** Em vez de criar uma
  tabela nova só para contagem, o mesmo registro de uso (que já existe para
  fins de histórico) é consultado por IP dentro de uma janela de tempo —
  mantém a solução simples.
- **`UserProfile` separado de `User`.** `User` é gerenciado pelo
  `PrismaAdapter` do Auth.js (nomes e campos não podem mudar); `UserProfile`
  é dado de produto, editável livremente, sem misturar as duas
  responsabilidades.
- **Onboarding é um redirect, não um bloqueio rígido.** Usuário sem perfil
  (novo ou conta antiga de antes desta sprint) é levado a `/perfil` ao
  acessar o Dashboard, mas nada é apagado ou impedido de outra forma —
  compatível com contas já existentes sem quebrar nada.
- **Comparação de skills usa `UserProfile.skills`, não mais uma lista
  estática no código.** Antes de existir perfil de usuário, a comparação
  usava um array fixo em `lib/skills.ts`; esse arquivo foi removido nesta
  sprint em favor do dado real por usuário.
- **Webhook n8n precisa de `N8N_TARGET_USER_ID`.** Como toda vaga pertence a
  um usuário e o webhook é uma chamada servidor-a-servidor (sem sessão de
  navegador), ele precisa saber a quem atribuir a vaga criada.
- **Campos array (`technologies`, `requirements`, `questions`, `checklist`,
  `UserProfile.skills`) são salvos como JSON-string no SQLite**, não em
  tabelas relacionadas. Decisão temporária do MVP — ver `lib/json.ts`. V2:
  normalizar em tabelas próprias.
- **Checklist é somente leitura.** Persistir o estado "concluído" por item
  exigiria mudar o schema — fora do escopo atual.
