import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mapJob } from "@/lib/jobMapper";
import StatusSelect from "@/components/StatusSelect";

export default async function VagaDetalhesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;

  const rawJob = await prisma.job.findUnique({ where: { id } });
  if (!rawJob) notFound();

  const job = mapJob(rawJob);

  return (
    <main className="min-h-screen bg-[#111218] text-[#E4E6EB] px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="font-mono text-sm text-[#378ADD] hover:text-[#4FA0F0]">
          ← Dashboard
        </Link>

        {created === "true" && (
          <div className="mt-4 rounded-md border border-[#3FB950]/40 bg-[#3FB950]/10 px-4 py-3 text-sm text-[#3FB950]">
            ✔ Vaga salva com sucesso.
          </div>
        )}

        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-sm text-[#7C8494] uppercase tracking-wide">{job.company}</p>
            <h1 className="mt-1 text-2xl font-semibold">{job.title}</h1>
          </div>
          <StatusSelect jobId={job.id} initialStatus={job.status} />
        </div>

        <div className="mt-8 space-y-6">
          {job.summary && (
            <Section label="Resumo">
              <p className="text-sm text-[#C4C7D0] leading-relaxed">{job.summary}</p>
            </Section>
          )}

          {job.technologies.length > 0 && (
            <Section label="Tecnologias">
              <div className="flex flex-wrap gap-2">
                {job.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-[#378ADD]/40 bg-[#378ADD]/10 px-3 py-1 font-mono text-xs text-[#378ADD]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {job.requirements.length > 0 && (
            <Section label="Requisitos">
              <ul className="space-y-1 text-sm text-[#C4C7D0]">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#378ADD]">–</span>
                    {req}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {job.questions.length > 0 && (
            <Section label="Perguntas prováveis">
              <ul className="space-y-1 text-sm text-[#C4C7D0]">
                {job.questions.map((q, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#378ADD]">?</span>
                    {q}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {job.checklist.length > 0 && (
            <Section label="Checklist">
              <ul className="space-y-1 text-sm text-[#C4C7D0]">
                {job.checklist.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#378ADD]">□</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </main>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[#2A2D3A] pt-4">
      <p className="font-mono text-xs text-[#7C8494] uppercase tracking-wide mb-2">{label}</p>
      {children}
    </div>
  );
}