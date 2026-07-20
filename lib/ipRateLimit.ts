import { prisma } from "@/lib/prisma";

// Proteção adicional contra abuso, além do limite diário por usuário
// (lib/rateLimit.ts): limita quantas análises um mesmo IP pode disparar numa
// janela de tempo, somando TODAS as contas que usarem aquele IP. Isso evita
// que alguém crie várias contas Google/GitHub só pra multiplicar o limite
// individual de 20/dia.
//
// Decisão de implementação (documentada aqui de propósito, como pedido):
// contamos linhas de AiUsage pelo IP dentro da janela, direto no banco — não
// em memória. Funções serverless da Vercel não compartilham memória entre
// instâncias/invocações, então um Map/contador em memória seria inútil em
// produção (cada requisição pode cair numa instância diferente). Reaproveita
// a tabela AiUsage que já existe pro registro de uso, em vez de criar uma
// tabela nova só pra isso — mantém a solução simples, como pedido.
const IP_WINDOW_MS = 60 * 60 * 1000; // 1 hora
const IP_LIMIT = 30; // chamadas por IP por hora, somando todos os usuários daquele IP

export async function checkIpRateLimit(ip: string | null): Promise<{ allowed: boolean }> {
  if (!ip) {
    // Sem IP identificável (comum em dev local) — não bloqueia. Em produção
    // atrás da Vercel, x-forwarded-for está sempre presente.
    return { allowed: true };
  }

  const since = new Date(Date.now() - IP_WINDOW_MS);
  const count = await prisma.aiUsage.count({
    where: { ip, createdAt: { gte: since } },
  });

  return { allowed: count < IP_LIMIT };
}

export function getClientIp(req: Request): string | null {
  // Na Vercel, o IP real do cliente vem no header x-forwarded-for. Pode ter
  // vários IPs separados por vírgula se passar por mais de um proxy — o
  // primeiro é o do cliente original.
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return null;
}
