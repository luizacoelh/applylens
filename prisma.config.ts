import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Usado SOMENTE pelo Prisma CLI (migrate dev, generate, studio) — sempre
// contra o SQLite LOCAL, nunca contra o Turso. O `prisma migrate dev` do
// libSQL/Turso não é suportado diretamente; o fluxo de deploy de schema para
// produção está documentado no README (seção "Deploy").
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});