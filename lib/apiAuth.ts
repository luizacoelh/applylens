import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Helper usado em toda rota de API que precisa de um usuário logado.
// Uso:
//   const { user, response } = await requireUser();
//   if (!user) return response;
export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      user: null as null,
      response: NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
    };
  }

  return { user: session.user, response: null as null };
}
