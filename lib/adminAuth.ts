import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Igual a requireUser() (lib/apiAuth.ts), mas também exige isAdmin.
// Usado só pelas rotas de /api/admin/*.
//
// IMPORTANTE — re-validação do isAdmin no banco:
// Com strategy "jwt", o campo isAdmin vive no cookie e não é relido do banco
// a cada request. Isso significa que se o isAdmin de alguém for revogado via
// /admin, o cookie JWT ainda tem isAdmin: true até expirar (15 minutos).
//
// Para rotas admin isso é inaceitável — por isso fazemos uma query extra aqui
// para confirmar o isAdmin atual no banco antes de qualquer operação.
// O custo é uma query leve (findUnique por PK com select de 1 campo),
// e como /admin é visitado raramente e por no máximo 1 usuário, é aceitável.
// Rotas não-admin (dashboard, vagas) não precisam disso.
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      user: null as null,
      response: NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
    };
  }

  // Re-valida isAdmin diretamente no banco — não confia só no cookie JWT.
  // Se o admin foi revogado, essa query retorna isAdmin: false imediatamente,
  // independente do que está no token.
  const freshUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!freshUser?.isAdmin) {
    return {
      user: null as null,
      response: NextResponse.json({ error: "Não encontrado." }, { status: 404 }),
    };
  }

  return { user: session.user, response: null as null };
}
