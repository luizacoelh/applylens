# ApplyLens — Roadmap

## Objetivo
Um CRM pessoal para centralizar e gerenciar candidaturas de estágio/emprego
de forma inteligente, sem a complexidade de um Kanban ou a bagunça de um
Notion.

## Fluxo do usuário
```
[Login] -> [Perfil (onboarding)] -> [Dashboard] -> [Nova Vaga] -> [Análise da IA] -> [Confirmação] -> [Detalhes da Vaga] -> [Atualizar Status/Metadados]
```

## Concluído

### Sprint 7 — Polimento SaaS
- [x] `UserProfile` (1:1 com `User`): objetivo, área de interesse, nível de
  experiência, skills
- [x] Página `/perfil` — visualizar e editar
- [x] Onboarding: usuário sem perfil é redirecionado a `/perfil` no acesso
  ao Dashboard, sem quebrar contas já existentes
- [x] Comparação de compatibilidade agora usa `UserProfile.skills` do
  usuário logado (removida a lista estática de `lib/skills.ts`)
- [x] Métricas reais no Dashboard: total de candidaturas, entrevistas,
  ofertas, taxa de conversão (além do que já existia: funil completo e
  tecnologias mais pedidas)
- [x] Exportação de vagas em CSV (`/api/jobs/export`), isolada por usuário
- [x] Limite de tamanho de entrada antes de enviar para o Gemini (8000
  caracteres, validado no cliente e revalidado no servidor)
- [x] Tabela `AiUsage` — registro de cada chamada à IA por usuário
- [x] Rate limit adicional por IP (além do limite diário por usuário já
  existente), reaproveitando a tabela `AiUsage`
- [x] README reescrito em tom profissional; deploy e arquitetura movidos
  para `DEPLOY.md`/`ARCHITECTURE.md` dedicados

### Sprint 6 — Autenticação e gerenciamento de usuários
- [x] Login real com Google e GitHub via Auth.js (NextAuth v5)
- [x] Tabelas `User`, `Account`, `Session`, `VerificationToken` via Prisma Adapter
- [x] `Job` relacionado a `User` — cada usuário só vê/edita as próprias vagas
- [x] `proxy.ts` protegendo navegação + checagem de sessão em cada rota de API
- [x] Limite diário de chamadas ao Gemini por usuário
- [x] Webhook n8n ajustado para o modelo de dados com usuário
- [x] Política de Privacidade e Termos de Uso
- [x] Deploy funcionando em produção (Vercel + Turso)

### Sprints anteriores
- [x] Dashboard com cards e tabela, busca e filtros (status/local/tecnologia)
- [x] Cadastro de vaga em duas etapas (Analisar → Confirmar → Salvar)
- [x] Análise automática via Gemini (resumo, tecnologias, requisitos,
  perguntas, checklist)
- [x] Campos de URL, local, salário e data da candidatura
- [x] Exclusão de vaga, edição de status e metadados
- [x] Tratamento de erro em produção (`error.tsx`, `global-error.tsx`,
  `not-found.tsx`, `loading.tsx`)
- [x] Suporte a Turso/libSQL selecionado automaticamente por variável de
  ambiente

## Próximos passos (em ordem de prioridade)

1. **Painel de consumo de IA** — a tabela `AiUsage` já existe e já é
   alimentada; falta uma tela (provavelmente em `/perfil` ou uma nova
   `/uso`) mostrando histórico e total aproximado por usuário.
2. **Ativar Magic Link por e-mail** — estrutura pronta (`VerificationToken`,
   comentário em `auth.ts`); falta escolher um provedor de envio (Resend, por
   exemplo).
3. **Checklist com itens marcáveis persistidos** — hoje é só leitura.
4. **Refinar comparação de skills** — hoje é match exato normalizado
   (case/acento-insensitive); não entende sinônimos ("JS" != "JavaScript").
5. **Screenshots reais no README** antes de tornar o repositório público.
6. **Ativar e testar o webhook n8n de ponta a ponta** com um workflow real.
7. **Monitoramento básico em produção** — logs estruturados / alerta simples
   quando `/api/analyze` falhar repetidamente.

## Explicitamente fora de escopo por enquanto

- Login por senha/credenciais (só OAuth + futuro Magic Link)
- Perfis/papéis de usuário (admin, etc.) — todo usuário logado tem os mesmos
  direitos sobre os próprios dados
- Painel administrativo de uso de IA (a tabela existe; a tela, não)
- Upload de currículo em PDF
- Extensão de navegador
- Integração direta com Gmail/Notion
- Scraping automático de vagas a partir de um link (hoje é preciso colar o texto)
- Analytics de uso do produto (diferente do registro de uso da IA)
