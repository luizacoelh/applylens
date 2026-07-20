"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExperienceLevel } from "@prisma/client";
import { EXPERIENCE_LABELS } from "@/lib/experienceLevel";
import { UserProfile } from "@/types/profile";

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
    <form onSubmit={handleSubmit} className="rounded-lg border border-[#2A2D3A] bg-[#1A1B23] p-6 space-y-4">
      {error && (
        <div className="rounded-md border border-[#E5534B]/40 bg-[#E5534B]/10 px-4 py-3 text-sm text-[#E5534B]">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="goal" className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">
          Objetivo profissional
        </label>
        <input
          id="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Ex: conseguir um estágio em desenvolvimento web"
          className="mt-2 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
        />
      </div>

      <div>
        <label htmlFor="interestArea" className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">
          Área de interesse
        </label>
        <input
          id="interestArea"
          value={interestArea}
          onChange={(e) => setInterestArea(e.target.value)}
          placeholder="Ex: Backend, Dados, QA"
          className="mt-2 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
        />
      </div>

      <div>
        <label htmlFor="experience" className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">
          Nível de experiência
        </label>
        <select
          id="experience"
          value={experience}
          onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
          className="mt-2 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
        >
          {Object.entries(EXPERIENCE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="skills" className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">
          Suas skills
        </label>
        <input
          id="skills"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          placeholder="Java, Git, SQL"
          className="mt-2 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
        />
        <p className="mt-1 text-xs text-[#7C8494]">
          Separe por vírgula. Usadas para comparar com as tecnologias pedidas em cada vaga.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-[#378ADD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4FA0F0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : isOnboarding ? "Salvar e continuar" : "Salvar alterações"}
        </button>
        {toast && <span className="font-mono text-xs text-[#378ADD]">{toast}</span>}
      </div>
    </form>
  );
}
