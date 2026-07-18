import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { mapJob } from "@/lib/jobMapper";
import StatusSelect from "@/components/job/StatusSelect";
import JobMetaEditor from "@/components/job/JobMetaEditor";
import DetailSection from "@/components/ui/DetailSection";
import TechBadge from "@/components/ui/TechBadge";
import ChecklistItem from "@/components/job/ChecklistItem";
import SkillCompatibility from "@/components/job/SkillCompatibility";
import DeleteJobButton from "@/components/job/DeleteJobButton";
import { LOCATION_LABELS } from "@/lib/jobLocation";

export default async function VagaDetalhesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const { created } = await searchParams;

  const rawJob = await prisma.job.findUnique({ where: { id } });
  // 404 tanto se a vaga não existe quanto se pertence a outro usuário — não
  // revelamos a existência de vagas de terceiros.
  if (!rawJob || rawJob.userId !== session.user.id) notFound();

  const job = mapJob(rawJob);

  return (
    <main className="min-h-screen bg-[#111218] text-[#E4E6EB] px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-mono text-sm text-[#378ADD] hover:text-[#4FA0F0]">
            ← Dashboard
          </Link>
          <DeleteJobButton jobId={job.id} />
        </div>

        {created === "true" && (
          <div className="mt-4 rounded-md border border-[#3FB950]/40 bg-[#3FB950]/10 px-4 py-3 text-sm text-[#3FB950]">
            ✔ Vaga salva com sucesso.
          </div>
        )}

        <div className="mt-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-sm text-[#7C8494] uppercase tracking-wide">{job.company}</p>
            <h1 className="mt-1 text-2xl font-semibold">{job.title}</h1>
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-[#378ADD] hover:text-[#4FA0F0] break-all"
              >
                {job.url} ↗
              </a>
            )}
            <p className="mt-2 text-xs text-[#7C8494]">
              {LOCATION_LABELS[job.location]}
              {job.salary && ` · ${job.salary}`}
            </p>
          </div>
          <StatusSelect jobId={job.id} initialStatus={job.status} />
        </div>

        <div className="mt-8 space-y-6">
          {job.summary && (
            <DetailSection label="Resumo">
              <p className="text-sm text-[#C4C7D0] leading-relaxed">{job.summary}</p>
            </DetailSection>
          )}

          {job.technologies.length > 0 && (
            <DetailSection label="Tecnologias">
              <div className="flex flex-wrap gap-2">
                {job.technologies.map((tech) => (
                  <TechBadge key={tech} tech={tech} />
                ))}
              </div>
            </DetailSection>
          )}

          {job.technologies.length > 0 && (
            <DetailSection label="Compatibilidade com suas skills">
              <SkillCompatibility technologies={job.technologies} />
            </DetailSection>
          )}

          {job.requirements.length > 0 && (
            <DetailSection label="Requisitos">
              <ul className="space-y-1 text-sm text-[#C4C7D0]">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#378ADD]">–</span>
                    {req}
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}

          {job.questions.length > 0 && (
            <DetailSection label="Perguntas prováveis">
              <ul className="space-y-1 text-sm text-[#C4C7D0]">
                {job.questions.map((q, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#378ADD]">?</span>
                    {q}
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}

          {job.checklist.length > 0 && (
            <DetailSection label="Checklist">
              <ul className="space-y-1">
                {job.checklist.map((item, i) => (
                  <ChecklistItem key={i} text={item} />
                ))}
              </ul>
            </DetailSection>
          )}

          <DetailSection label="Detalhes da candidatura">
            <JobMetaEditor
              jobId={job.id}
              initialUrl={job.url}
              initialLocation={job.location}
              initialSalary={job.salary}
              initialAppliedAt={job.appliedAt}
            />
          </DetailSection>
        </div>
      </div>
    </main>
  );
}
