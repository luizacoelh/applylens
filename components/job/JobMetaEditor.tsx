"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobLocation } from "@prisma/client";
import { LOCATION_LABELS } from "@/lib/jobLocation";
import { UpdateJobRequest } from "@/types/job";

// Sem wrapper de card próprio — vive dentro do GlassPanel compartilhado da
// página de detalhes (app/vaga/[id]/page.tsx), junto com as outras seções.
// Antes tinha um card + título embutido próprios, o que causava o bug de
// "Detalhes da candidatura" duplicado (o DetailSection por fora já mostra
// o título) — corrigido nesta sprint junto com o resto do visual.
export default function JobMetaEditor({
  jobId,
  initialUrl,
  initialLocation,
  initialSalary,
  initialAppliedAt,
}: {
  jobId: string;
  initialUrl: string | null;
  initialLocation: JobLocation;
  initialSalary: string | null;
  initialAppliedAt: Date;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [location, setLocation] = useState<JobLocation>(initialLocation);
  const [salary, setSalary] = useState(initialSalary ?? "");
  const [appliedAt, setAppliedAt] = useState(toDateInputValue(initialAppliedAt));
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function toDateInputValue(date: Date): string {
    return new Date(date).toISOString().slice(0, 10);
  }

  async function handleSave() {
    setIsSaving(true);
    setToast(null);

    const body: UpdateJobRequest = { url, location, salary, appliedAt };

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast(data.error ?? "Não foi possível salvar.");
        return;
      }

      setToast("Salvo.");
      router.refresh();
      setTimeout(() => setToast(null), 2500);
    } catch {
      setToast("Falha de conexão.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="url" className="text-xs text-[#7C8494]">
          Link da vaga
        </label>
        <input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="glass-input mt-1 w-full rounded-xl px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="location" className="text-xs text-[#7C8494]">
            Local
          </label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value as JobLocation)}
            className="glass-input mt-1 w-full rounded-xl px-3 py-2 text-sm"
          >
            {Object.values(JobLocation).map((l) => (
              <option key={l} value={l}>
                {LOCATION_LABELS[l]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="salary" className="text-xs text-[#7C8494]">
            Salário
          </label>
          <input
            id="salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="Não informado"
            className="glass-input mt-1 w-full rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="appliedAt" className="text-xs text-[#7C8494]">
            Data da candidatura
          </label>
          <input
            id="appliedAt"
            type="date"
            value={appliedAt}
            onChange={(e) => setAppliedAt(e.target.value)}
            className="glass-input mt-1 w-full rounded-xl px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-xl px-4 py-2 text-sm font-medium text-[#08131F] transition-shadow disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            fontFamily: "var(--font-outfit)",
            background: "linear-gradient(155deg, #85B7EB, #378ADD)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.25) inset, 0 8px 20px -8px rgba(55,138,221,0.6)",
          }}
        >
          {isSaving ? "Salvando..." : "Salvar detalhes"}
        </button>
        {toast && <span className="font-mono text-xs text-[#85B7EB]">{toast}</span>}
      </div>
    </div>
  );
}
