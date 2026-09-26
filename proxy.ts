import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = ["/login", "/privacidade", "/termos"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((path) => pathname === path) || pathname.startsWith("/api/auth");

  // Injeta x-pathname em cada resposta para que Server Components (ex: NewJobFab)
  // possam saber em qual rota estão sendo renderizados sem precisar de Client Component.
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  if (isPublic) {
    return response;
  }

  if (pathname.startsWith("/api/")) {
    return response;
  }

  if (!req.auth?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|ico)$).*)"],
};
