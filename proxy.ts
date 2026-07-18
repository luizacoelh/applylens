import { NextResponse } from "next/server";
import { auth } from "@/auth";

// No Next.js 16, "middleware.ts" foi renomeado para "proxy.ts" e passou a
// rodar sempre em runtime Node.js (o suporte a Edge foi removido). Isso é
// bom para nós: dá para usar auth() com o PrismaAdapter (que depende de
// driver nativo de banco) direto aqui, sem precisar dividir a config em
// duas partes (auth.config.ts + auth.ts) como pedem os tutoriais mais
// antigos de Auth.js, cuja separação existe só para viabilizar Edge runtime.
//
// IMPORTANTE — isto é só a PRIMEIRA linha de defesa (redireciona para /login
// com boa UX). A proteção de verdade está em cada rota/página, que também
// chama auth() e retorna 401/404 por conta própria (ver lib/apiAuth.ts e os
// Server Components de app/page.tsx e app/vaga/[id]/page.tsx). Depender só
// do proxy para segurança é desaconselhado pela própria comunidade Next.js
// (houve um CVE em 2025 envolvendo bypass de middleware via header
// forjado) — por isso a checagem é sempre duplicada, nunca só aqui.
const PUBLIC_PATHS = ["/login", "/privacidade", "/termos"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((path) => pathname === path) || pathname.startsWith("/api/auth");

  if (isPublic) {
    return NextResponse.next();
  }

  // Rotas de API não são redirecionadas — uma resposta de redirect quebraria
  // qualquer fetch() feito pelo front, que espera JSON. Cada rota de API já
  // faz sua própria checagem de auth() e devolve 401 em formato JSON (ver
  // lib/apiAuth.ts) — aqui só cuidamos da navegação de páginas.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!req.auth?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Roda em tudo, exceto assets estáticos do Next e arquivos públicos.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|ico)$).*)"],
};
