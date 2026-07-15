import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que o bundler (Turbopack/webpack) tente empacotar os módulos
  // nativos do driver de banco — eles precisam ser resolvidos diretamente
  // pelo Node.js em runtime. Sem isso, o build na Vercel pode falhar ou
  // gerar uma função serverless com o binário nativo ausente/corrompido.
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
    "@libsql/client",
    "@prisma/adapter-libsql",
  ],
};

export default nextConfig;
