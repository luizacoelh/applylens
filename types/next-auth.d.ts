import type { DefaultSession } from "next-auth";

// O tipo padrão de session.user não inclui `id` — adicionamos aqui para
// poder usar session.user.id com segurança de tipos em todo o projeto
// (ver callbacks.session em auth.ts, que é quem realmente popula o valor).
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
