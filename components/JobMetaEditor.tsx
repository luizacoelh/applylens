"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobLocation } from "@prisma/client";
import { LOCATION_LABELS } from "@/lib/jobLocation";
import { UpdateJobRequest } from "@/types/job";

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
    <div className="rounded-lg border border-[#2A2D3A] bg-[#1A1B23] p-5 space-y-4">
      <p className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">Detalhes da candidatura</p>

      <div>
        <label htmlFor="url" className="text-xs text-[#7C8494]">
          Link da vaga
        </label>
        <input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
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
            className="mt-1 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
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
            className="mt-1 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
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
            className="mt-1 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-[#378ADD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4FA0F0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : "Salvar detalhes"}
        </button>
        {toast && <span className="font-mono text-xs text-[#378ADD]">{toast}</span>}
      </div>
    </div>
  );
}
