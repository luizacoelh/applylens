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

### Sprint 15 — Auditoria e hardening de segurança
- [x] `next.config.ts`: headers de segurança HTTP adicionados em todas as rotas:
  `X-Frame-Options: DENY` (clickjacking), `X-Content-Type-Options: nosniff`
  (MIME sniffing), `Referrer-Policy: strict-origin-when-cross-origin`
  (vazamento de IDs em Referer), `Permissions-Policy` (câmera/microfone/GPS),
  `Content-Security-Policy` completa (XSS, fontes, conexões)
- [x] `app/api/webhook/n8n/route.ts`: comparação de segredo trocada de `!==`
  para `crypto.timingSafeEqual` — elimina timing attack que permitia descobrir
  o segredo byte a byte medindo tempo de resposta
- [x] `lib/gemini.ts`: validação de schema (`isValidAnalysis`) adicionada após
  `JSON.parse` — segunda linha de defesa contra prompt injection; outputs fora
  dos limites de tamanho ou shape inesperado são rejeitados antes de ir ao banco
- [x] Auditoria completa documentada em `ARCHITECTURE.md`:
  IDOR ✅, SQL Injection ✅, Mass Assignment ✅, Open Redirect ✅,
  Race Condition ✅, TOCTTOU n/a, XSS (React escaping) ✅
- [ ] **Backlog — Performance** (próxima iteração):
  trocar `strategy: "database"` → `strategy: "jwt"` em `auth.ts` para
  eliminar roundtrip ao Turso a cada `auth()`, paralelizar queries com
  `Promise.all` em `app/page.tsx` e `app/vaga/[id]/page.tsx`.
  ATENÇÃO: ao migrar para JWT, `isAdmin` ficará no cookie por até 30 dias —
  `requireAdmin()` deve re-validar no banco (ver nota em `ARCHITECTURE.md`)

### Sprint 14 — Correções pós-deploy
- [x] `proxy.ts`: header `x-pathname` injetado em todas as respostas —
  corrigia 404 nas páginas de vaga causado pelo `NewJobFab` tentando ler
  um header inexistente durante o render
- [x] `components/ui/NewJobFab.tsx`: `try/catch` na leitura do header para
  não quebrar o render em caso de falha; FAB agora some corretamente em
  `/nova-vaga` e `/admin`
- [x] `app/nova-vaga/page.tsx`: `BackButton` adicionado antes do wordmark
- [x] `components/dashboard/StatsBar.tsx`: label "Funil" removido (só
  `N vagas`); `hotspots={false}` no card de tecnologias elimina o glow
  estranho no canto inferior direito; `font-mono` trocado por `font-outfit`
  nos dois cards e nos badges

### Sprint 13 — UX e consistência visual final
- [x] `components/ui/BackButton.tsx` criado: botão de voltar reutilizável com
  `glass-btn` + ícone SVG — substitui todos os links de texto simples
  `← Dashboard` em: `app/vaga/[id]/page.tsx`, `app/admin/page.tsx`,
  `app/perfil/page.tsx`
- [x] `components/ui/NewJobFab.tsx` atualizado: FAB oculto nas rotas
  `/nova-vaga` e `/admin` via header `x-pathname` lido no Server Component
- [x] `middleware.ts` criado: injeta `x-pathname` em cada request pra
  permitir renderização condicional do FAB sem Client Component
- [x] `components/dashboard/StatsBar.tsx`: label "Funil" removido, substituído
  por `N vagas`; `hotspots={false}` no card de tecnologias — eliminava o
  glow estranho no canto inferior direito que aparecia quando o conteúdo
  não preenchia o card
- [x] `app/page.tsx`: "Exportar CSV" removido do header do Dashboard
- [x] `components/profile/ProfileForm.tsx`: card "Exportar candidaturas"
  adicionado no final da página de perfil (oculto no onboarding)
- [x] `app/admin/page.tsx`: `BackButton` no lugar do link de texto simples

### Sprint 12 — Performance + FAB + polish mobile
- [x] `app/globals.css`: removido `url(#glass-distort)` de `.glass-chip`,
  `.glass-input` e `.glass-btn` — painéis grandes (`.glass-surface`) mantêm
  a distorção completa; elementos pequenos e repetidos ficam com
  `blur + saturate` que é visualmente equivalente e muito mais barato.
  `will-change: transform` adicionado em `.glass-rim` pra promover painéis
  pra camada de GPU durante scroll.
- [x] `app/loading.tsx`: skeleton corrigido pra espelhar exatamente o layout
  do Dashboard em mobile (`flex-col gap-4` em mobile, `flex-row` em `sm+`) —
  eliminava o desnívelamento visível na foto enviada
- [x] `components/ui/NewJobFab.tsx` criado: FAB global de "Nova vaga", fixo
  no canto inferior direito — círculo `56×56px` em mobile (só ícone `+`),
  expande pra botão com texto em `sm+`. Verifica sessão internamente como
  Server Component, não aparece no login/onboarding
- [x] `app/layout.tsx` atualizado: importa e monta o `NewJobFab` abaixo de
  `{children}` — disponível em todas as páginas autenticadas sem duplicar
  lógica

### Sprint 11 — Polish de UX pré-produção
- [x] `app/loading.tsx` refeito: usa `studio-backdrop` + glows + skeletons
  que espelham o layout real do Dashboard (wordmark, stats, filtros, cards)
  — elimina o flash de fundo escuro simples entre navegações
- [x] `UserMenu`: foto + nome viram o link do perfil (hover `bg-white/6`),
  link "Perfil" redundante removido; "Admin" e "Sair" com `font-outfit` e
  `transition-colors` no lugar de `font-mono`
- [x] `app/perfil/page.tsx`: redundância "Seu perfil / Editar perfil"
  resolvida — título único "Perfil" no modo edição
- [x] `app/nova-vaga/page.tsx`: label "Nova vaga · Etapa 1/2" removido;
  labels de formulário padronizados com `font-outfit` (eliminado último
  `font-mono` restante na página)

### Sprint 10 — Redesign visual "vidro" — conclusão
- [x] Convertido: `app/perfil/page.tsx`, `components/profile/ProfileForm.tsx`
- [x] Convertido: `app/admin/page.tsx`, `components/admin/AppSettingsForm.tsx`,
  `components/admin/UsersTable.tsx`
- [x] Convertido: `app/privacidade/page.tsx`, `app/termos/page.tsx`
- [x] Convertido: `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`
  (`global-error.tsx` declara o filtro SVG inline por não poder depender do
  `layout.tsx`)
- [x] Convertido: `components/job/DeleteJobButton.tsx`,
  `components/job/ChecklistItem.tsx`
- [x] Identidade visual "vidro" 100% aplicada — nenhum arquivo usa mais
  `bg-[#1A1B23]`, `border-[#2A2D3A]` ou rótulos `font-mono $ comando`

### Sprint 9 — Redesign visual "vidro" (fase 1)
- [x] Sistema de design de vidro/refração criado (`GlassPanel`,
  `.glass-input`, `.glass-btn`, `.glass-chip` em `app/globals.css`) —
  detalhes e trade-offs em `ARCHITECTURE.md`
- [x] Tipografia trocada de Geist para Outfit + Inter
- [x] Filtro SVG de refração (`#glass-distort`) centralizado em
  `app/layout.tsx`, reaproveitado por todo elemento de vidro
- [x] Convertido: Login, Dashboard completo (stats, filtros, busca,
  cards/tabela de vaga, menu do usuário), Nova Vaga, Detalhes da Vaga

### Sprint 8 — Revisão de segurança/arquitetura + painel admin
- [x] Corrigido bug visual: "Detalhes da candidatura" aparecia duplicado na
  tela de detalhes da vaga (título repetido entre o `DetailSection` e o
  próprio `JobMetaEditor`)
- [x] Corrigida condição de corrida no rate limit de IA por usuário
  (`lib/rateLimit.ts`) — checagem e incremento agora são uma única operação
  atômica no banco, em vez de leitura e escrita separadas
- [x] Limites globais (análises/dia por usuário, análises/hora por IP,
  tamanho máximo de descrição) migrados de constantes no código para a
  tabela `AppSettings`, editável sem deploy
- [x] Override de limite diário por usuário (`User.dailyAiLimitOverride`) —
  substitui a necessidade de um caso especial no código para contas
  específicas
- [x] Painel `/admin` (restrito por `User.isAdmin`): edição dos limites
  globais e da tabela de usuários (override individual + promover/rebaixar
  admin)
- [x] Registro de uso de IA agora inclui uma estimativa aproximada de
  tokens (`AiUsage.tokens`), para dar mais contexto num futuro painel de
  consumo
- [x] Revisão do fluxo OAuth (Google e GitHub) — confirmado configurado
  corretamente em produção
- [x] `.env.example` recriado (tinha sido perdido num merge anterior) e
  atualizado com todas as variáveis atuais
- [x] Checklist documentado para evitar bugs de merge manual entre pacotes
  de mudanças e o projeto local (ver `ARCHITECTURE.md`)

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

1. **Painel de consumo de IA (dentro de `/admin`)** — a tabela `AiUsage` já
   registra usuário, ação, tokens aproximados e IP; falta agregar isso numa
   visualização (total por usuário, por dia) dentro do painel já existente.
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
