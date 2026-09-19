import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";

// Só dois campos editáveis por aqui: o override de limite diário de IA, e o
// próprio isAdmin (pra promover/rebaixar outra conta). Nunca deixa um admin
// remover o próprio isAdmin por essa rota — evita se trancar fora sem querer.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireAdmin();
  if (!user) return response;

  const { id } = await params;
  const body = await req.json();
  const { dailyAiLimitOverride, isAdmin } = body;

  if (id === user.id && isAdmin === false) {
    return NextResponse.json(
      { error: "Você não pode remover seu próprio acesso de admin por aqui." },
      { status: 400 }
    );
  }

  if (
    dailyAiLimitOverride !== undefined &&
    dailyAiLimitOverride !== null &&
    (typeof dailyAiLimitOverride !== "number" || dailyAiLimitOverride <= 0 || !Number.isInteger(dailyAiLimitOverride))
  ) {
    return NextResponse.json(
      { error: "dailyAiLimitOverride precisa ser um inteiro positivo, ou null para usar o padrão global." },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(dailyAiLimitOverride !== undefined ? { dailyAiLimitOverride } : {}),
        ...(isAdmin !== undefined ? { isAdmin } : {}),
      },
      select: { id: true, isAdmin: true, dailyAiLimitOverride: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar usuário (admin):", error);
    return NextResponse.json({ error: "Não foi possível atualizar o usuário." }, { status: 500 });
  }
}
