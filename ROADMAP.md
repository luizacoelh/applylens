# ApplyLens — Roadmap

## Objetivo
Um CRM pessoal para centralizar e gerenciar candidaturas de estágio/emprego de
forma inteligente, sem a complexidade de um Kanban ou a bagunça de um Notion.

## Fluxo do usuário
```
[Login] -> [Dashboard] -> [Nova Vaga] -> [Análise da IA] -> [Confirmação] -> [Detalhes da Vaga] -> [Atualizar Status/Metadados]
```

## Concluído

### Sprint 6 — Autenticação e gerenciamento de usuários
- [x] Login real com Google e GitHub via Auth.js (NextAuth v5)
- [x] Tabelas `User`, `Account`, `Session`, `VerificationToken` via Prisma Adapter
- [x] Sessão em banco (`strategy: "database"`)
- [x] `Job` relacionado a `User` (`userId` obrigatório) — cada usuário só vê/edita as próprias vagas
- [x] `proxy.ts` protegendo navegação (redireciona não-logado para `/login`)
- [x] Toda rota de API confere sessão de novo (`lib/apiAuth.ts`) — proteção em duas camadas
- [x] Vaga de outro usuário responde 404, não 403 (não confirma existência)
- [x] Tela de login com o mesmo design do resto do app
- [x] `UserMenu` no Dashboard (avatar, nome, botão de sair)
- [x] Estrutura pronta para Magic Link por e-mail (tabela `VerificationToken` já existe, provider comentado em `auth.ts`)
- [x] Limite diário de chamadas ao Gemini por usuário — anti-abuso (`lib/rateLimit.ts`)
- [x] Webhook n8n ajustado para o novo modelo de dados (`N8N_TARGET_USER_ID`)
- [x] Política de Privacidade e Termos de Uso (`/privacidade`, `/termos`)
- [x] `.env.example` revisado com todas as variáveis de autenticação
- [x] README com passo a passo de criação dos apps OAuth (dev e produção)
- [x] `layout.tsx` com metadata/idioma corrigidos (ainda estava com o boilerplate do create-next-app)

### Sprints anteriores
- [x] Dashboard com cards e tabela, busca e filtros (status/local/tecnologia)
- [x] Estatísticas: funil por status, tecnologias mais pedidas
- [x] Campos: URL da vaga, local (remoto/híbrido/presencial), salário, data da candidatura
- [x] Comparação de tecnologias da vaga com skills conhecidas (`lib/skills.ts`)
- [x] Edição de status e metadados na tela de detalhes
- [x] Exclusão de vaga
- [x] Tratamento de erro específico na integração com o Gemini (429/404/400)
- [x] Páginas de erro/loading/not-found + `global-error.tsx`
- [x] Suporte a Turso/libSQL para produção, selecionado automaticamente por variável de ambiente
- [x] `serverExternalPackages` configurado para os drivers nativos de banco
- [x] Componentes reorganizados em `ui/`, `job/`, `dashboard/`, `auth/`
- [x] Deploy documentado passo a passo (Turso + Vercel) no README

## Próximos passos (em ordem de prioridade)

1. **Executar o deploy de verdade com autenticação** — criar os apps OAuth de
   produção, resetar o banco do Turso (breaking change do `Job.userId`),
   configurar as novas env vars na Vercel e validar o login em produção.
2. **Ativar Magic Link por e-mail** — a estrutura já existe (tabela
   `VerificationToken`, comentário em `auth.ts`); falta escolher um provedor
   de envio de e-mail (Resend, por exemplo) e descomentar o provider.
3. **Checklist com itens marcáveis persistidos** — hoje é só leitura; exigiria
   mudar `checklist` de string JSON simples para algo com estado por item.
4. **Ativar e testar o webhook n8n de ponta a ponta** com um workflow real.
5. **Refinar comparação de skills** — hoje é match exato normalizado
   (case/acento-insensitive); não entende sinônimos ("JS" != "JavaScript").
6. **Monitoramento básico em produção** — logs estruturados / alerta simples
   quando `/api/analyze` falhar repetidamente (rate limit do Gemini, etc.)

## Explicitamente fora de escopo por enquanto

- Login por senha/credenciais (só OAuth + futuro Magic Link)
- Perfis/papéis de usuário (admin, etc.) — todo usuário logado tem os mesmos direitos sobre os próprios dados
- Upload de currículo em PDF
- Extensão de navegador
- Integração direta com Gmail/Notion
- Scraping automático de vagas a partir de um link (hoje é preciso colar o texto)
- Analytics de uso
