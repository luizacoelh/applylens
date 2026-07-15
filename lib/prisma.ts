import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Este projeto usa DOIS drivers de banco dependendo do ambiente:
//
// - Local / desenvolvimento: SQLite via better-sqlite3 (arquivo local, rápido, zero custo)
// - Produção (Vercel): libSQL via Turso (mesmo SQLite por baixo, mas hospedado —
//   necessário porque o filesystem de funções serverless é efêmero e não guarda
//   um arquivo .db entre requisições; ver README, seção "Deploy")
//
// A escolha é automática: se TURSO_DATABASE_URL estiver definida no ambiente,
// usamos o adapter do Turso; caso contrário, caímos no SQLite local. Os dois
// pacotes ficam marcados em next.config.ts (serverExternalPackages) para não
// serem empacotados pelo bundler — o Node.js resolve o binário nativo
// diretamente em runtime, o que evita problemas comuns de build serverless.
function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl) {
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

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
