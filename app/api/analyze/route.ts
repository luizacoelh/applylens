import { NextRequest, NextResponse } from "next/server";
import { analyzeJobWithGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();

    if (!description || typeof description !== "string" || description.trim().length < 20) {
      return NextResponse.json(
        { error: "Descrição da vaga muito curta ou ausente." },
        { status: 400 }
      );
    }

    const analysis = await analyzeJobWithGemini(description);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Erro ao analisar vaga:", error);
    return NextResponse.json(
      { error: "Não foi possível analisar a vaga. Tente novamente." },
      { status: 500 }
    );
  }
}