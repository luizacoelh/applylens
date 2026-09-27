import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

// Duração do access token (cookie JWT). Curto de propósito:
// - Rápido: auth() só decodifica o cookie, sem tocar o banco
// - Seguro: se o token for comprometido, expira em 15 minutos
// O refresh token (tabela Session no banco) dura 30 dias e é o que
// permite renovar o access token silenciosamente quando ele expira.
const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutos em segundos

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // JWT para o access token (cookie de curta duração).
  // O PrismaAdapter ainda gerencia refresh tokens na tabela Session —
  // isso é o que permite revogar acesso: apagar a linha de Session no banco.
  // Quando o access token expira, o Auth.js tenta renovar via refresh token.
  // Se o refresh token não existir mais no banco, o usuário é deslogado
  // automaticamente — sem precisar invalidar nada manualmente.
  session: {
    strategy: "jwt",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    // Chamado quando o token é criado (login) ou renovado (a cada request
    // após expirar). Gravamos id e isAdmin no token no momento do login —
    // esses valores ficam no cookie e são lidos sem tocar o banco a cada
    // auth(). O isAdmin é lido do banco só no login inicial.
    async jwt({ token, user }) {
      if (user) {
        // Primeiro login: user vem populado pelo adapter com dados do banco
        token.id = user.id;
        token.isAdmin = (user as typeof user & { isAdmin: boolean }).isAdmin ?? false;
      }
      return token;
    },

    // Chamado a cada auth() — só lê o token que já está no cookie,
    // sem query ao banco. É aqui que a performance melhora: a sessão
    // inteira vive no cookie JWT, não numa tabela Session.
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
});
