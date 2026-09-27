import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Este projeto usa DOIS drivers de banco dependendo do ambiente:
//
// - Local / desenvolvimento: SQLite via better-sqlite3 (arquivo local, rápido, zero custo)
// - Produção (Vercel): libSQL via Turso (mesmo SQLite por baixo, mas hospedado)
//
// IMPORTANTE — globalForPrisma em TODOS os ambientes (incluindo produção):
// Em serverless (Vercel), cada função pode ser reutilizada entre requisições
// dentro da mesma instância quente ("warm"). Sem o globalThis, cada request
// criaria um novo PrismaClient e abriria uma nova conexão HTTP ao Turso —
// esse cold start de conexão era a principal causa do skeleton aparecer por
// 800ms+ em produção, mesmo com JWT e Promise.all já aplicados.
// Com o cache no globalThis, a conexão é reutilizada enquanto a função
// permanecer quente — que é o comportamento esperado e documentado pela
// própria Prisma para ambientes serverless.
function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (process.env.NODE_ENV === "production" && tursoUrl) {
    if (!tursoToken) {
      throw new Error(
        "TURSO_DATABASE_URL está definida mas TURSO_AUTH_TOKEN não. Ambas são necessárias para conectar ao Turso."
      );
    }
    const adapter = new PrismaLibSql({ url: tursoUrl, authToken: tursoToken });
    return new PrismaClient({ adapter });
  }

  const localUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaBetterSqlite3({ url: localUrl });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Cache em TODOS os ambientes — não só em desenvolvimento.
// Em dev evita "too many connections" com hot reload.
// Em produção reutiliza a conexão HTTP ao Turso entre requests na mesma
// instância serverless quente, eliminando o overhead de reconexão.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
