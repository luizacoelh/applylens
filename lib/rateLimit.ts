import { prisma } from "@/lib/prisma";

// Limite simples de chamadas ao Gemini por usuário, para evitar abuso
// (alguém deixando a tela de Nova Vaga aberta batendo "Analisar" sem parar,
// ou uso automatizado). Contado no banco (não em memória) porque funções
// serverless não compartilham memória entre instâncias — um contador em
// memória seria inútil em produção na Vercel.
const DAILY_LIMIT = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

export async function checkAndConsumeGeminiQuota(userId: string): Promise<RateLimitResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { geminiCallCount: true, geminiCallResetAt: true },
  });

  if (!user) {
    // Não deveria acontecer (userId vem de uma sessão válida), mas por
    // segurança negamos em vez de deixar passar sem contabilizar.
    return { allowed: false, remaining: 0, limit: DAILY_LIMIT };
  }

  const now = new Date();
  const windowExpired = now.getTime() - user.geminiCallResetAt.getTime() > WINDOW_MS;

  if (windowExpired) {
    await prisma.user.update({
      where: { id: userId },
      data: { geminiCallCount: 1, geminiCallResetAt: now },
    });
    return { allowed: true, remaining: DAILY_LIMIT - 1, limit: DAILY_LIMIT };
  }

  if (user.geminiCallCount >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, limit: DAILY_LIMIT };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { geminiCallCount: { increment: 1 } },
  });

  return {
    allowed: true,
    remaining: DAILY_LIMIT - user.geminiCallCount - 1,
    limit: DAILY_LIMIT,
  };
}
