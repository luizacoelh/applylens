// Aplica as migrations do Prisma (prisma/migrations/*/migration.sql) direto
// no banco do Turso, usando o mesmo pacote @libsql/client que a aplicação já
// usa em produção — sem precisar instalar a CLI do Turso (que no Windows
// exige WSL).
//
// Uso:
//   node scripts/apply-turso-migrations.mjs
//
// Lê TURSO_DATABASE_URL e TURSO_AUTH_TOKEN do .env. Roda cada migration.sql
// em ordem cronológica (mesma ordem das pastas), estatemente por statement.
import "dotenv/config";
import { createClient } from "@libsql/client";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "prisma", "migrations");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error(
    "TURSO_DATABASE_URL e/ou TURSO_AUTH_TOKEN não encontradas no .env. Preencha as duas antes de rodar este script."
  );
  process.exit(1);
}

// Remove comentários de linha (-- ...) e de bloco (/* ... */), depois separa
// em statements individuais por ";". Seguro aqui porque as migrations deste
// projeto são só DDL (CREATE/ALTER/DROP/INSERT...SELECT simples) — nenhum
// valor de string contém ";" no meio.
function splitStatements(sql) {
  const withoutBlockComments = sql.replace(/\/\*[\s\S]*?\*\//g, "");
  const withoutLineComments = withoutBlockComments
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  return withoutLineComments
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function main() {
  const client = createClient({ url, authToken });

  const folders = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(); // nomes de pasta começam com timestamp, ordem alfabética = ordem cronológica

  if (folders.length === 0) {
    console.log("Nenhuma migration encontrada em prisma/migrations.");
    return;
  }

  console.log(`Encontradas ${folders.length} migrations. Aplicando em ordem...\n`);

  for (const folder of folders) {
    const sqlPath = join(migrationsDir, folder, "migration.sql");
    let sql;
    try {
      sql = readFileSync(sqlPath, "utf-8");
    } catch {
      console.log(`  (pulado — sem migration.sql em ${folder})`);
      continue;
    }

    const statements = splitStatements(sql);
    console.log(`→ ${folder} (${statements.length} statement(s))`);

    for (const statement of statements) {
      try {
        await client.execute(statement);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // "duplicate column" / "already exists" indicam que essa migration já
        // foi aplicada antes — seguro ignorar e continuar para a próxima.
        if (/already exists|duplicate column/i.test(message)) {
          console.log(`   (já aplicado, ignorando: ${message})`);
          continue;
        }
        console.error(`   ERRO no statement:\n   ${statement}\n   → ${message}`);
        process.exit(1);
      }
    }
  }

  console.log("\nTodas as migrations foram aplicadas com sucesso no Turso.");
  client.close();
}

main();
