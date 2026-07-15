# Organização dos componentes

- **`ui/`** — componentes de apresentação genéricos, sem lógica de negócio,
  reutilizáveis em qualquer contexto: `StatusBadge`, `TechBadge`,
  `DetailSection`, `EmptyState`.
- **`job/`** — componentes específicos do domínio "vaga": `JobCard`,
  `JobTable`, `JobMetaEditor`, `StatusSelect`, `DeleteJobButton`,
  `SkillCompatibility`, `ChecklistItem`.
- **`dashboard/`** — componentes específicos da tela de Dashboard:
  `DashboardClient`, `FilterBar`, `StatsBar`.

Critério usado: se o componente poderia ser reaproveitado em qualquer projeto
sem saber o que é um "Job", vai em `ui/`. Se ele conhece o conceito de vaga
mas não é exclusivo do Dashboard, vai em `job/`. Se é específico da tela do
Dashboard, vai em `dashboard/`.
