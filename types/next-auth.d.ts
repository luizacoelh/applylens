import type { DefaultSession } from "next-auth";

// O tipo padrão de session.user não inclui `id`/`isAdmin` — adicionamos
// aqui para poder usar esses campos com segurança de tipos.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }
}

// O PrismaAdapter retorna um AdapterUser. Como nosso model User possui
// `isAdmin`, adicionamos esse campo ao tipo do AdapterUser também.
declare module "next-auth/adapters" {
  interface AdapterUser {
    isAdmin: boolean;
  }
}