import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapJob } from "@/lib/jobMapper";
import { JobStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });

  if (!job) {
    return NextResponse.json({ error: "Vaga não encontrada." }, { status: 404 });
  }

  return NextResponse.json(mapJob(job));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: { status: JobStatus } = await req.json();
  const { status } = body;

  if (typeof status !== "string" || !Object.values(JobStatus).includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const job = await prisma.job.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(mapJob(job));
}