import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/appSettings";
import AppSettingsForm from "@/components/admin/AppSettingsForm";
import UsersTable from "@/components/admin/UsersTable";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Mesma regra do resto do app: quem não tem acesso recebe "não
  // encontrado", não "sem permissão" — não confirma que a rota existe.
  if (!session.user.isAdmin) {
    notFound();
  }

  const [settings, users] = await Promise.all([
    getAppSettings(),
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        dailyAiLimitOverride: true,
        geminiCallCount: true,
        createdAt: true,
        _count: { select: { jobs: true, aiUsage: true } },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#111218] text-[#E4E6EB] px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="font-mono text-sm text-[#378ADD] hover:text-[#4FA0F0]">
          ← Dashboard
        </Link>

        <p className="mt-4 font-mono text-sm text-[#378ADD] mb-1">Admin</p>
        <h1 className="text-2xl font-semibold mb-8">Configurações e usuários</h1>

        <div className="space-y-6">
          <AppSettingsForm initialSettings={settings} />
          <UsersTable initialUsers={users} currentUserId={session.user.id} />
        </div>
      </div>
    </main>
  );
}
