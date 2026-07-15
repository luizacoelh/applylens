import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Usado SOMENTE pelo Prisma CLI (migrate dev, generate, studio) — sempre
// contra o SQLite LOCAL, nunca contra o Turso. O `prisma migrate dev` do
// libSQL/Turso não é suportado diretamente; o fluxo de deploy de schema para
// produção está documentado no README (seção "Deploy").
//
// Usa process.env diretamente (com fallback) em vez do helper env() do
// Prisma porque env() lança erro se a variável não existir — e em produção
// (Vercel) DATABASE_URL propositalmente NÃO é definida (usamos
// TURSO_DATABASE_URL/TURSO_AUTH_TOKEN em lib/prisma.ts em vez disso). O
// `prisma generate` do postinstall só precisa que esta config carregue sem
// travar; ele não abre conexão nenhuma com o banco.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  },
});