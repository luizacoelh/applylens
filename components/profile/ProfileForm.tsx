"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExperienceLevel } from "@prisma/client";
import { EXPERIENCE_LABELS } from "@/lib/experienceLevel";
import { UserProfile } from "@/types/profile";
import GlassPanel from "@/components/ui/Glass";

export default function ProfileForm({
  initialProfile,
  isOnboarding,
}: {
  initialProfile: UserProfile | null;
  isOnboarding: boolean;
}) {
  const router = useRouter();

  const [goal, setGoal] = useState(initialProfile?.goal ?? "");
  const [interestArea, setInterestArea] = useState(initialProfile?.interestArea ?? "");
  const [experience, setExperience] = useState<ExperienceLevel>(
    initialProfile?.experience ?? "NAO_INFORMADO"
  );
  const [skillsText, setSkillsText] = useState((initialProfile?.skills ?? []).join(", "));

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, interestArea, experience, skills }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar o perfil.");
        return;
      }

      if (isOnboarding) {
        router.push("/");
        return;
      }

      setToast("Perfil salvo.");
      router.refresh();
      setTimeout(() => setToast(null), 2500);
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <GlassPanel plateClassName="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-[#E5534B]/30 bg-[#E5534B]/10 px-4 py-3 text-sm text-[#E5534B]">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="goal"
            className="block text-xs font-medium text-[#7C8494] uppercase tracking-wide mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Objetivo profissional
          </label>
          <input
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Ex: conseguir um estágio em desenvolvimento web"
            className="glass-input w-full rounded-xl px-4 py-2.5 text-sm text-[#E4E6EB] placeholder:text-[#4A5060]"
          />
        </div>

        <div>
          <label
            htmlFor="interestArea"
            className="block text-xs font-medium text-[#7C8494] uppercase tracking-wide mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Área de interesse
          </label>
          <input
            id="interestArea"
            value={interestArea}
            onChange={(e) => setInterestArea(e.target.value)}
            placeholder="Ex: Backend, Dados, QA"
            className="glass-input w-full rounded-xl px-4 py-2.5 text-sm text-[#E4E6EB] placeholder:text-[#4A5060]"
          />
        </div>

        <div>
          <label
            htmlFor="experience"
            className="block text-xs font-medium text-[#7C8494] uppercase tracking-wide mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Nível de experiência
          </label>
          <select
            id="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
            className="glass-input w-full rounded-xl px-4 py-2.5 text-sm text-[#E4E6EB]"
          >
            {Object.entries(EXPERIENCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="skills"
            className="block text-xs font-medium text-[#7C8494] uppercase tracking-wide mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Suas skills
          </label>
          <input
            id="skills"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="Java, Git, SQL"
            className="glass-input w-full rounded-xl px-4 py-2.5 text-sm text-[#E4E6EB] placeholder:text-[#4A5060]"
          />
          <p className="mt-1.5 text-xs text-[#4A5060]">
            Separe por vírgula. Usadas para comparar com as tecnologias pedidas em cada vaga.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-[#378ADD] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4FA0F0] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {isSaving ? "Salvando..." : isOnboarding ? "Salvar e continuar" : "Salvar alterações"}
          </button>
          {toast && (
            <span className="text-xs text-[#3FB950]" style={{ fontFamily: "var(--font-outfit)" }}>
              {toast}
            </span>
          )}
        </div>
      </form>
    </GlassPanel>
  );
}
