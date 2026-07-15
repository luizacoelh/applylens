# ApplyLens — Roadmap

## Objetivo
Um CRM pessoal para centralizar e gerenciar candidaturas de estágio/emprego de
forma inteligente, sem a complexidade de um Kanban ou a bagunça de um Notion.

## Fluxo do usuário (MVP)
```
[Dashboard] -> [Nova Vaga] -> [Análise da IA] -> [Confirmação] -> [Detalhes da Vaga] -> [Atualizar Status/Metadados]
```

## Concluído

- [x] Dashboard com cards e tabela, busca e filtros (status/local/tecnologia)
- [x] Estatísticas: funil por status, tecnologias mais pedidas
- [x] Campos: URL da vaga, local (remoto/híbrido/presencial), salário, data da candidatura
- [x] Comparação de tecnologias da vaga com skills conhecidas (`lib/skills.ts`)
- [x] Edição de status e metadados na tela de detalhes
- [x] Exclusão de vaga
- [x] Tratamento de erro específico na integração com o Gemini (429/404/400), agora exibido de fato na UI
- [x] Páginas de erro/loading/not-found + `global-error.tsx` para falhas no layout raiz
- [x] Endpoint de webhook para automação futura (n8n), desativado por padrão
- [x] Suporte a Turso/libSQL para produção, selecionado automaticamente por variável de ambiente
- [x] `serverExternalPackages` configurado para os drivers nativos de banco (evita quebra de build serverless)
- [x] `maxDuration`/`runtime` explícitos nas rotas que chamam o Gemini (evita timeout prematuro em produção)
- [x] Inicialização preguiçosa do cliente Gemini (uma env var ausente não derruba a app inteira)
- [x] Componentes reorganizados em `ui/`, `job/`, `dashboard/`
- [x] Deploy documentado passo a passo (Turso + Vercel) no README

## Próximos passos (em ordem de prioridade)

1. **Executar o deploy de verdade** — criar o banco no Turso, aplicar as
   migrations, configurar a Vercel e validar em produção (passos manuais
   documentados no README, ainda não executados).
2. **Checklist com itens marcáveis persistidos** — hoje é só leitura; exigiria
   mudar `checklist` de string JSON simples para algo com estado por item.
3. **Ativar e testar o webhook n8n de ponta a ponta** com um workflow real.
4. **Refinar comparação de skills** — hoje é match exato normalizado
   (case/acento-insensitive); não entende sinônimos ("JS" != "JavaScript").
5. **Monitoramento básico em produção** — logs estruturados / alerta simples
   quando `/api/analyze` falhar repetidamente (rate limit do Gemini, etc.)

## Explicitamente fora de escopo por enquanto

- Login / múltiplos usuários
- OAuth
- Upload de currículo em PDF
- Extensão de navegador
- Integração direta com Gmail/Notion
- Scraping automático de vagas a partir de um link (hoje é preciso colar o texto)
