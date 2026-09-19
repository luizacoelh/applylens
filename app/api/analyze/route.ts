import { NextRequest, NextResponse } from "next/server";
import { analyzeJobWithGemini } from "@/lib/gemini";
import { requireUser } from "@/lib/apiAuth";
import { checkAndConsumeGeminiQuota } from "@/lib/rateLimit";
import { checkIpRateLimit, getClientIp } from "@/lib/ipRateLimit";
import { logAiUsage } from "@/lib/aiUsage";
import { getAppSettings } from "@/lib/appSettings";

// A chamada ao Gemini já levou entre 16s e 27s em teste (com retry de rate
// limit). O padrão da Vercel para funções serverless costuma ser bem menor
// que isso — sem esse export, a requisição pode ser encerrada (504) antes da
// IA responder. Precisa rodar em Node.js (não Edge) por causa do driver do
// banco usado em outras rotas do projeto.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const settings = await getAppSettings();

  const ip = getClientIp(req);
  const ipCheck = await checkIpRateLimit(ip);
  if (!ipCheck.allowed) {
    return NextResponse.json(
      { error: "Muitas análises vindas deste IP em pouco tempo. Tente novamente mais tarde." },
      { status: 429 }
    );
  }

  const quota = await checkAndConsumeGeminiQuota(user.id);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: `Limite diário de análises por IA atingido (${quota.limit}/dia). Tente novamente amanhã.`,
      },
      { status: 429 }
    );
  }

  try {
    const { description } = await req.json();

    if (!description || typeof description !== "string" || description.trim().length < 20) {
      return NextResponse.json(
        { error: "Descrição da vaga muito curta ou ausente." },
        { status: 400 }
      );
    }

    if (description.length > settings.maxDescriptionLength) {
      return NextResponse.json(
        {
          error: `Descrição muito longa (${description.length} caracteres, limite de ${settings.maxDescriptionLength}). Cole só o texto da vaga, sem conteúdo extra da página.`,
        },
        { status: 400 }
      );
    }

    const analysis = await analyzeJobWithGemini(description);

    // Estimativa grosseira de tokens (≈4 caracteres por token em
    // português/inglês) — a API do Gemini nem sempre devolve contagem
    // exata, e isso é só para dar uma ordem de grandeza no futuro painel de
    // consumo, não para cobrança ou limite real. Não bloqueia a resposta —
    // se o registro falhar, a análise já foi entregue com sucesso de
    // qualquer forma (ver lib/aiUsage.ts).
    const approxTokens = Math.ceil(description.length / 4);
    await logAiUsage({ userId: user.id, action: "analyze_job", tokens: approxTokens, ip });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Erro ao analisar vaga:", error);
    // As mensagens lançadas por lib/gemini.ts já são textos curados e seguros
    // de mostrar (rate limit, modelo indisponível, chave ausente etc.) — só
    // caem no fallback genérico erros verdadeiramente inesperados.
    const message =
      error instanceof Error && error.message ? error.message : "Não foi possível analisar a vaga. Tente novamente.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
