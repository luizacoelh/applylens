import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stringifyArray } from "@/lib/json";
import { mapJob } from "@/lib/jobMapper";
import { CreateJobRequest } from "@/types/job";

export async function GET() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobs.map(mapJob));
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateJobRequest = await req.json();
    const { description, company, title, summary, requirements, technologies, questions, checklist } = body;

    if (!description || !company || !title) {
      return NextResponse.json(
        { error: "Dados incompletos para salvar a vaga." },
        { status: 400 }
      );
    }

    const data = {
      description,
      company,
      title,
      summary: summary ?? null,
      requirements: stringifyArray(requirements),
      technologies: stringifyArray(technologies),
      questions: stringifyArray(questions),
      checklist: stringifyArray(checklist),
    };
       const job = await prisma.job.create({ data });

    return NextResponse.json(mapJob(job), { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar vaga:", error);
    return NextResponse.json(
      { error: "Não foi possível salvar a vaga." },
      { status: 500 }
    );
  }
}