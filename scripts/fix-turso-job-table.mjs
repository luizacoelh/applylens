// Corrige o Turso quando a tabela Job ficou sem a coluna `userId` porque a
// migration add_authentication falhou no meio (comum quando já havia linhas
// de teste em Job — SQLite não aceita adicionar uma coluna obrigatória numa
// tabela com dados sem um valor padrão).
//
// Isso APAGA a tabela Job e recria do zero (perde as vagas de teste que
// estiverem no Turso). NÃO mexe em User/Account/Session/VerificationToken —
// login continua intacto.
//
// Uso: node scripts/fix-turso-job-table.mjs
import "dotenv/config";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("TURSO_DATABASE_URL e/ou TURSO_AUTH_TOKEN não encontradas no .env.");
  process.exit(1);
}

const statements = [
  `DROP TABLE IF EXISTS "Job";`,
  `CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APLICADA',
    "url" TEXT,
    "location" TEXT NOT NULL DEFAULT 'NAO_INFORMADO',
    "salary" TEXT,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT,
    "requirements" TEXT,
    "technologies" TEXT,
    "questions" TEXT,
    "checklist" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE INDEX "Job_userId_idx" ON "Job"("userId");`,
];

async function main() {
  const client = createClient({ url, authToken });

  console.log("Apagando e recriando a tabela Job no Turso...");
  for (const statement of statements) {
    await client.execute(statement);
  }

  console.log("Pronto. Tabela Job recriada com a coluna userId. User/Account/Session preservados.");
  client.close();
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
