import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

// Configuração central do Auth.js (NextAuth v5). Este arquivo é importado
// tanto pelas rotas/páginas normais quanto pelo proxy.ts — no Next.js 16 o
// proxy roda sempre em runtime Node.js (não Edge), então não precisamos
// separar a config em duas partes como pedem os tutoriais mais antigos: o
// PrismaAdapter (que usa driver nativo de banco) funciona nos dois lugares.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // Sessão em banco (tabela Session), não JWT — necessário porque o
  // requisito da sprint pede a tabela Session de verdade, e porque assim
  // dá para invalidar sessões revogando a linha no banco, se precisar.
  session: {
    strategy: "database",
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Google confirma a propriedade do e-mail. Permitimos que o mesmo
      // usuário entre por Google ou GitHub sem criar duas contas separadas.
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      // O GitHub também é um provedor confiável deste fluxo OAuth. Sem esta
      // opção, o Auth.js bloqueia por padrão a ligação pelo mesmo e-mail.
      allowDangerousEmailAccountLinking: true,
    }),
    // Preparado para Magic Link por e-mail no futuro. A tabela
    // VerificationToken já existe no schema para isso. Só falta:
    //   1. npm install nodemailer (ou usar um provider como Resend)
    //   2. descomentar o import e o provider abaixo
    //   3. configurar AUTH_EMAIL_* / RESEND_API_KEY no .env
    //
    // import Nodemailer from "next-auth/providers/nodemailer";
    // Nodemailer({
    //   server: process.env.EMAIL_SERVER,
    //   from: process.env.EMAIL_FROM,
    // }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    // Com session strategy "database", o Auth.js já injeta `user` completo
    // (vindo da tabela User) em vez de um token JWT — só precisamos garantir
    // que `session.user.id` existe, já que o tipo padrão não inclui id.
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
