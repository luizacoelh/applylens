import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Igual a requireUser() (lib/apiAuth.ts), mas também exige isAdmin. Usado só
// pelas rotas de /api/admin/*. Sempre 404 (não 403) quando a pessoa está
// logada mas não é admin — mesma lógica de "não revelar recurso que a
// pessoa não tem acesso" já usada no resto do app.
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      user: null as null,
      response: NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
    };
  }

  if (!session.user.isAdmin) {
    return {
      user: null as null,
      response: NextResponse.json({ error: "Não encontrado." }, { status: 404 }),
    };
  }

  return { user: session.user, response: null as null };
}
