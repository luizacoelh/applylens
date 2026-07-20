// Garante que as tabelas novas (UserProfile, AiUsage) existam no Turso, sem
// tocar em Job/User/Account/Session (que já estão corretos e com dados).
// Também limpa uma tabela "new_Job" órfã deixada por uma tentativa anterior.
//
// Uso: node scripts/sync-turso-schema.mjs
import "dotenv/config";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("TURSO_DATABASE_URL e/ou TURSO_AUTH_TOKEN não encontradas no .env.");
  process.exit(1);
}

const statements = [
  `DROP TABLE IF EXISTS "new_Job";`,

  `CREATE TABLE IF NOT EXISTS "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "goal" TEXT,
    "interestArea" TEXT,
    "experience" TEXT NOT NULL DEFAULT 'NAO_INFORMADO',
    "skills" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "AiUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tokens" INTEGER,
    "ip" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE INDEX IF NOT EXISTS "AiUsage_userId_idx" ON "AiUsage"("userId");`,
  `CREATE INDEX IF NOT EXISTS "AiUsage_ip_createdAt_idx" ON "AiUsage"("ip", "createdAt");`,
];

async function main() {
  const client = createClient({ url, authToken });

  console.log("Sincronizando tabelas novas no Turso (UserProfile, AiUsage)...");
  for (const statement of statements) {
    await client.execute(statement);
  }

  console.log("Pronto. Job/User/Account/Session não foram alterados.");
  client.close();
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});