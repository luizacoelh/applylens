import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { mapJob } from "@/lib/jobMapper";
import DashboardClient from "@/components/dashboard/DashboardClient";
import UserMenu from "@/components/auth/UserMenu";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Onboarding: usuário sem perfil ainda (novo, ou conta antiga de antes
  // desta sprint) é levado a completar o perfil antes de ver o Dashboard.
  // É só um redirect, não bloqueia nada de fato — a pessoa pode voltar a
  // qualquer momento em /perfil, e nenhum dado existente é afetado.
  const profile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) {
    redirect("/perfil?onboarding=true");
  }

  const jobs = await prisma.job.findMany({
    where: { userId: session.user.id },
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
          <div className="flex items-center gap-3">
            <a
              href="/api/jobs/export"
              className="inline-block w-fit rounded-md border border-[#2A2D3A] px-4 py-2 text-sm font-medium text-[#C4C7D0] transition-colors hover:border-[#378ADD]/50"
            >
              Exportar CSV
            </a>
            <Link
              href="/nova-vaga"
              className="inline-block w-fit rounded-md bg-[#378ADD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4FA0F0]"
            >
              + Nova vaga
            </Link>
            <UserMenu user={session.user} />
          </div>
        </div>

        <DashboardClient jobs={jobList} />
      </div>
    </main>
  );
}
