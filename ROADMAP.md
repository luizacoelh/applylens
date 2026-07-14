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
- [x] Tratamento de erro mais específico na integração com o Gemini (429/404/400)
- [x] Páginas de erro/loading/not-found
- [x] Endpoint de webhook para automação futura (n8n), desativado por padrão

## Próximos passos (em ordem de prioridade)

1. **Migrar SQLite local → Turso (libSQL)** — pré-requisito real para deploy na
   Vercel. Ver seção "Deploy" do README.
2. **Deploy na Vercel** — depende do item 1.
3. **Checklist com itens marcáveis persistidos** — hoje é só leitura; exigiria
   mudar `checklist` de string JSON simples para algo com estado por item.
4. **Ativar e testar o webhook n8n de ponta a ponta** com um workflow real.
5. **Refinar comparação de skills** — hoje é match exato normalizado
   (case/acento-insensitive); não entende sinônimos ("JS" != "JavaScript").

## Explicitamente fora de escopo por enquanto

- Login / múltiplos usuários
- OAuth
- Upload de currículo em PDF
- Extensão de navegador
- Integração direta com Gmail/Notion
- Scraping automático de vagas a partir de um link (hoje é preciso colar o texto)
