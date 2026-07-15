import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { mapJob } from "@/lib/jobMapper";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
  });

  const jobList = jobs.map(mapJob);

  return (
    <main className="min-h-screen bg-[#111218] text-[#E4E6EB] px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-sm text-[#378ADD] mb-1">ApplyLens Dashboard</p>
            <h1 className="text-2xl font-semibold">Suas candidaturas</h1>
          </div>
          <Link
            href="/nova-vaga"
            className="inline-block w-fit rounded-md bg-[#378ADD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4FA0F0]"
          >
            + Nova vaga
          </Link>
        </div>

        <DashboardClient jobs={jobList} />
      </div>
    </main>
  );
}
