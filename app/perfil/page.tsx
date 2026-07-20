import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseArray } from "@/lib/json";
import ProfileForm from "@/components/profile/ProfileForm";
import { UserProfile } from "@/types/profile";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { onboarding } = await searchParams;
  const isOnboarding = onboarding === "true";

  const rawProfile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } });
  const profile: UserProfile | null = rawProfile
    ? {
        goal: rawProfile.goal,
        interestArea: rawProfile.interestArea,
        experience: rawProfile.experience,
        skills: parseArray(rawProfile.skills),
      }
    : null;

  return (
    <main className="min-h-screen bg-[#111218] text-[#E4E6EB] px-4 py-16">
      <div className="mx-auto max-w-xl">
        {!isOnboarding && (
          <Link href="/" className="font-mono text-sm text-[#378ADD] hover:text-[#4FA0F0]">
            ← Dashboard
          </Link>
        )}

        <p className="mt-4 font-mono text-sm text-[#378ADD] mb-1">
          {isOnboarding ? "Bem-vindo(a) ao ApplyLens" : "Seu perfil"}
        </p>
        <h1 className="text-2xl font-semibold mb-2">
          {isOnboarding ? "Complete seu perfil pra começar" : "Editar perfil"}
        </h1>
        <p className="text-sm text-[#7C8494] mb-8">
          {isOnboarding
            ? "Suas skills são usadas para comparar automaticamente com o que cada vaga pede — nada aqui é obrigatório, mas quanto mais completo, melhor a comparação."
            : "Essas informações são usadas para comparar suas skills com as tecnologias de cada vaga."}
        </p>

        <ProfileForm initialProfile={profile} isOnboarding={isOnboarding} />
      </div>
    </main>
  );
}
