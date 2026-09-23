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
    <main className="min-h-screen text-[#E4E6EB] px-4 py-10">
      <div className="studio-backdrop">
        <div className="studio-glow" style={{ width: 560, height: 560, top: -220, left: -160, background: "radial-gradient(circle, rgba(55,138,221,0.5), transparent 70%)" }} />
        <div className="studio-glow" style={{ width: 480, height: 480, top: "30%", right: -200, background: "radial-gradient(circle, rgba(133,183,235,0.3), transparent 70%)" }} />
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span
                className="h-[22px] w-[22px] rounded-[7px]"
                style={{
                  background: "linear-gradient(155deg, #85B7EB, #378ADD)",
                  boxShadow: "0 0 12px rgba(55,138,221,0.55), inset 0 1px 1px rgba(255,255,255,0.5)",
                }}
              />
              <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                ApplyLens
              </span>
            </div>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
              Suas candidaturas
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/jobs/export"
              className="glass-input inline-block w-fit rounded-xl px-4 py-2 text-sm font-medium text-[#C4C7D0]"
            >
              Exportar CSV
            </a>
            <Link
              href="/nova-vaga"
              className="inline-block w-fit rounded-xl px-4 py-2 text-sm font-semibold text-[#08131F] transition-shadow"
              style={{
                background: "linear-gradient(155deg, #85B7EB, #378ADD)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.25) inset, 0 8px 20px -8px rgba(55,138,221,0.6)",
              }}
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
