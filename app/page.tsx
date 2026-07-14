import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { mapJob } from "@/lib/jobMapper";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/jobStatus";



export default async function DashboardPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
  });

  const jobList = jobs.map(mapJob);

  return (
    <main className="min-h-screen bg-[#111218] text-[#E4E6EB] px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-sm text-[#378ADD] mb-1">ApplyLens Dashboard</p>
            <h1 className="text-2xl font-semibold">Suas candidaturas</h1>
          </div>
          <Link
            href="/nova-vaga"
            className="rounded-md bg-[#378ADD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4FA0F0]"
          >
            + Nova vaga
          </Link>
        </div>

        {jobList.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {jobList.map((job) => (
              <Link
                key={job.id}
                href={`/vaga/${job.id}`}
                className="block rounded-lg border border-[#2A2D3A] bg-[#1A1B23] p-5 transition-colors hover:border-[#378ADD]/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono text-[#7C8494] uppercase tracking-wide">
                      {job.company}
                    </p>
                    <h2 className="mt-1 text-lg font-medium">{job.title}</h2>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 font-mono text-xs ${STATUS_STYLES[job.status]}`}
                  >
                    {STATUS_LABELS[job.status]}
                  </span>
                </div>

                {job.summary && (
                  <p className="mt-2 line-clamp-2 text-sm text-[#C4C7D0]">{job.summary}</p>
                )}

                <p className="mt-3 text-xs text-[#7C8494]">
                  Adicionada em{" "}
                  {new Intl.DateTimeFormat("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }).format(job.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[#2A2D3A] p-12 text-center">
      <p className="text-[#C4C7D0]">Nenhuma vaga adicionada ainda.</p>
      <p className="mt-1 text-sm text-[#7C8494]">
        Cole a descrição de uma vaga para começar a organizar suas candidaturas.
      </p>
      <Link
        href="/nova-vaga"
        className="mt-4 inline-block rounded-md bg-[#378ADD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4FA0F0]"
      >
        + Nova vaga
      </Link>
    </div>
  );
}