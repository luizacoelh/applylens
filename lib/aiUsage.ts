import { prisma } from "@/lib/prisma";

// Registro de cada chamada à API do Gemini. Não bloqueia nem afeta o
// resultado da análise — só grava um histórico pra permitir, no futuro, ver
// consumo por usuário. Se o registro falhar por algum motivo, não deve
// derrubar a análise que já foi concluída com sucesso, então erros aqui só
// são logados, nunca propagados.
export async function logAiUsage(params: {
  userId: string;
  action: string;
  tokens?: number;
  ip?: string | null;
}): Promise<void> {
  try {
    await prisma.aiUsage.create({
      data: {
        userId: params.userId,
        action: params.action,
        tokens: params.tokens,
        ip: params.ip ?? undefined,
      },
    });
  } catch (error) {
    console.error("Erro ao registrar uso de IA (não bloqueante):", error);
  }
}
