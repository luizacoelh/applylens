// Marca um usuário como admin (User.isAdmin = true), buscando pelo e-mail.
// Necessário rodar uma vez pra ativar o primeiro admin — depois disso, o
// próprio painel /admin permite promover outras contas.
//
// Funciona tanto contra o SQLite local quanto contra o Turso, escolhendo o
// driver do mesmo jeito que lib/prisma.ts (se TURSO_DATABASE_URL estiver no
// .env, usa Turso; senão, usa o SQLite local). Se algum dia lib/prisma.ts
// mudar essa lógica de seleção, atualize aqui também.
//
// Uso: node scripts/set-admin.mjs seu-email@gmail.com
import "dotenv/config";

const email = process.argv[2];
if (!email) {
  console.error("Uso: node scripts/set-admin.mjs seu-email@exemplo.com");
  process.exit(1);
}

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

async function main() {
  if (tursoUrl && tursoToken) {
    const { createClient } = await import("@libsql/client");
    const client = createClient({ url: tursoUrl, authToken: tursoToken });

    const result = await client.execute({
      sql: `UPDATE "User" SET "isAdmin" = 1 WHERE "email" = ?`,
      args: [email],
    });

    if (result.rowsAffected === 0) {
      console.error(`Nenhum usuário encontrado com o e-mail ${email} no Turso.`);
      process.exit(1);
    }

    console.log(`Pronto — ${email} agora é admin (Turso/produção).`);
    client.close();
    return;
  }

  const Database = (await import("better-sqlite3")).default;
  const dbPath = (process.env.DATABASE_URL ?? "file:./prisma/dev.db").replace(/^file:/, "");
  const db = new Database(dbPath);

  const result = db.prepare(`UPDATE "User" SET "isAdmin" = 1 WHERE "email" = ?`).run(email);

  if (result.changes === 0) {
    console.error(`Nenhum usuário encontrado com o e-mail ${email} no banco local.`);
    process.exit(1);
  }

  console.log(`Pronto — ${email} agora é admin (SQLite local).`);
  db.close();
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
