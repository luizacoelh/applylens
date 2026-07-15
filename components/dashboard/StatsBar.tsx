import { Job } from "@/types/job";
import { STATUS_LABELS } from "@/lib/jobStatus";
import { JobStatus } from "@prisma/client";

function topTechnologies(jobs: Job[], limit = 5): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const job of jobs) {
    for (const tech of job.technologies) {
      counts.set(tech, (counts.get(tech) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export default function StatsBar({ jobs }: { jobs: Job[] }) {
  const statusCounts = Object.values(JobStatus).map((status) => ({
    status,
    count: jobs.filter((j) => j.status === status).length,
  }));

  const techs = topTechnologies(jobs);

  if (jobs.length === 0) return null;

  return (
    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-[#2A2D3A] bg-[#1A1B23] p-4">
        <p className="font-mono text-xs text-[#7C8494] uppercase tracking-wide mb-3">
          Funil ({jobs.length} {jobs.length === 1 ? "vaga" : "vagas"})
        </p>
        <div className="flex flex-wrap gap-4">
          {statusCounts.map(({ status, count }) => (
            <div key={status}>
              <p className="text-xl font-semibold">{count}</p>
              <p className="text-xs text-[#7C8494]">{STATUS_LABELS[status]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-[#2A2D3A] bg-[#1A1B23] p-4">
        <p className="font-mono text-xs text-[#7C8494] uppercase tracking-wide mb-3">
          Tecnologias mais pedidas
        </p>
        {techs.length === 0 ? (
          <p className="text-sm text-[#7C8494]">Sem dados ainda.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {techs.map(({ name, count }) => (
              <span
                key={name}
                className="rounded-full border border-[#378ADD]/40 bg-[#378ADD]/10 px-3 py-1 font-mono text-xs text-[#378ADD]"
              >
                {name} · {count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
