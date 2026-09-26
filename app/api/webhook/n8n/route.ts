import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { stringifyArray } from "@/lib/json";
import { mapJob } from "@/lib/jobMapper";
import { analyzeJobWithGemini } from "@/lib/gemini";
import { logAiUsage } from "@/lib/aiUsage";
import { getAppSettings } from "@/lib/appSettings";
import { JobAnalysis } from "@/types/job";

export const runtime = "nodejs";
export const maxDuration = 60;

// Valida o shape do output do Gemini antes de persistir no banco.
// Defesa contra prompt injection: mesmo que o modelo retorne dados
// manipulados, eles são rejeitados se saírem fora dos limites esperados.
function isValidAnalysis(data: unknown): data is JobAnalysis {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.company === "string" && d.company.length > 0 && d.company.length < 200 &&
    typeof d.title === "string" && d.title.length > 0 && d.title.length < 200 &&
    typeof d.summary === "string" && d.summary.length < 2000 &&
    Array.isArray(d.requirements) && d.requirements.length <= 20 &&
    Array.isArray(d.technologies) && d.technologies.length <= 30 &&
    Array.isArray(d.questions) && d.questions.length <= 10 &&
    Array.isArray(d.checklist) && d.checklist.length <= 10
  );
}

export async function POST(req: NextRequest) {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  const targetUserId = process.env.N8N_TARGET_USER_ID;

  if (!secret || !targetUserId) {
    return NextResponse.json(
      { error: "Webhook não configurado. Defina N8N_WEBHOOK_SECRET e N8N_TARGET_USER_ID no .env para ativar." },
      { status: 501 }
    );
  }

  const receivedSecret = req.headers.get("x-webhook-secret") ?? "";

  // timingSafeEqual em vez de !== para evitar timing attack:
  // comparação com !== para assim que encontra o primeiro byte diferente,
  // o que permite a um atacante medir microssegundos e descobrir o segredo
  // byte a byte. timingSafeEqual sempre compara todos os bytes no mesmo tempo.
  // Os buffers precisam ter o mesmo tamanho para a função não lançar exceção —
  // se os tamanhos diferirem já sabemos que é inválido, mas ainda executamos
  // a comparação pra não vazar informação sobre o tamanho do segredo.
  const secretBuf = Buffer.from(secret);
  const receivedBuf = Buffer.from(receivedSecret);
  const lengthsMatch = secretBuf.length === receivedBuf.length;
  // Compara com um buffer de mesmo tamanho se os tamanhos diferirem,
  // pra timingSafeEqual não lançar — o resultado não importa nesse caso
  // porque lengthsMatch já é false.
  const safeReceived = lengthsMatch ? receivedBuf : Buffer.alloc(secretBuf.length);
  const valid = lengthsMatch && timingSafeEqual(secretBuf, safeReceived);

  if (!valid) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    return NextResponse.json(
      { error: "N8N_TARGET_USER_ID não corresponde a nenhum usuário cadastrado." },
      { status: 500 }
    );
  }

  const settings = await getAppSettings();

  try {
    const { description } = await req.json();

    if (!description || typeof description !== "string" || description.trim().length < 20) {
      return NextResponse.json(
        { error: "Campo 'description' ausente ou muito curto." },
        { status: 400 }
      );
    }

    if (description.length > settings.maxDescriptionLength) {
      return NextResponse.json(
        { error: `Descrição muito longa (limite de ${settings.maxDescriptionLength} caracteres).` },
        { status: 400 }
      );
    }

    const analysis = await analyzeJobWithGemini(description);

    // Valida o shape antes de persistir — defesa contra prompt injection
    if (!isValidAnalysis(analysis)) {
      return NextResponse.json(
        { error: "A IA retornou um formato inesperado. Tente novamente." },
        { status: 500 }
      );
    }

    const approxTokens = Math.ceil(description.length / 4);
    await logAiUsage({ userId: targetUser.id, action: "analyze_job_webhook", tokens: approxTokens });

    const job = await prisma.job.create({
      data: {
        userId: targetUser.id,
        description,
        company: analysis.company,
        title: analysis.title,
        summary: analysis.summary,
        requirements: stringifyArray(analysis.requirements),
        technologies: stringifyArray(analysis.technologies),
        questions: stringifyArray(analysis.questions),
        checklist: stringifyArray(analysis.checklist),
      },
    });

    return NextResponse.json(mapJob(job), { status: 201 });
  } catch (error) {
    console.error("Erro no webhook n8n:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
