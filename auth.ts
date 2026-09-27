import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

// Duração da sessão JWT: 30 dias.
// O usuário permanece logado até fazer logout explicitamente ou a sessão
// ser revogada no banco (via /admin). Esse é o comportamento padrão e
// esperado em qualquer aplicação web — nenhum serviço sério desloga o
// usuário a cada 15 minutos no uso normal.
//
// Por que 30 dias é seguro aqui:
// - O cookie é httpOnly (JavaScript não consegue ler), secure (só HTTPS)
//   e sameSite=lax (protege contra CSRF) — configurado automaticamente
//   pelo Auth.js.
// - Não há dados financeiros ou sensíveis no token, só id e isAdmin.
// - Operações admin re-validam isAdmin no banco a cada request
//   (ver lib/adminAuth.ts), então revogar acesso tem efeito imediato
//   mesmo com o token ainda válido.
// - Se precisar deslogar alguém remotamente antes dos 30 dias, basta
//   apagar a linha correspondente na tabela Session do banco.
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 dias em segundos

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    // updateAge: a cada quanto tempo o token é renovado silenciosamente
    // enquanto o usuário está ativo. 24h significa que um usuário ativo
    // diariamente nunca percebe a sessão expirando.
    updateAge: 24 * 60 * 60,
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as typeof user & { isAdmin: boolean }).isAdmin ?? false;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
});
