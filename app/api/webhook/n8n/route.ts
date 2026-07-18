import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stringifyArray } from "@/lib/json";
import { mapJob } from "@/lib/jobMapper";
import { analyzeJobWithGemini } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

// Endpoint preparado para uma futura automação via n8n (ex: um workflow que
// monitora e-mails ou um feed de vagas e dispara isso automaticamente).
// Está DESATIVADO por padrão: só funciona se N8N_WEBHOOK_SECRET estiver
// definido no .env. Sem isso, retorna 501 — não é uma rota pública aberta.
//
// Desde a Sprint 6 (autenticação), toda vaga pertence a um usuário — como
// este endpoint é chamado servidor-a-servidor (sem sessão de navegador), ele
// precisa saber A QUEM atribuir a vaga criada. Isso é feito via
// N8N_TARGET_USER_ID no .env: o id do usuário (já cadastrado via login
// normal ao menos uma vez) que vai "dono" das vagas criadas por automação.
//
// Uso esperado (a partir de um nó HTTP Request do n8n):
//   POST /api/webhook/n8n
//   header: x-webhook-secret: <mesmo valor de N8N_WEBHOOK_SECRET>
//   body: { "description": "texto completo da vaga" }
export async function POST(req: NextRequest) {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  const targetUserId = process.env.N8N_TARGET_USER_ID;

  if (!secret || !targetUserId) {
    return NextResponse.json(
      {
        error:
          "Webhook não configurado. Defina N8N_WEBHOOK_SECRET e N8N_TARGET_USER_ID no .env para ativar.",
      },
      { status: 501 }
    );
  }

  const receivedSecret = req.headers.get("x-webhook-secret");
  if (receivedSecret !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    return NextResponse.json(
      { error: "N8N_TARGET_USER_ID não corresponde a nenhum usuário cadastrado." },
      { status: 500 }
    );
  }

  try {
    const { description } = await req.json();

    if (!description || typeof description !== "string" || description.trim().length < 20) {
      return NextResponse.json(
        { error: "Campo 'description' ausente ou muito curto." },
        { status: 400 }
      );
    }

    const analysis = await analyzeJobWithGemini(description);

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
