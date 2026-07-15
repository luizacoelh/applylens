"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobStatus } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/jobStatus";

export default function StatusSelect({ jobId, initialStatus }: { jobId: string; initialStatus: JobStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [toast, setToast] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleChange(newStatus: JobStatus) {
    const previousStatus = status;
    setStatus(newStatus);
    setIsUpdating(true);
    setToast(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        setToast("Não foi possível atualizar o status.");
        setStatus(previousStatus);
        return;
      }

      setToast("Status atualizado.");
      router.refresh();
      setTimeout(() => setToast(null), 2500);
    } catch {
      setToast("Falha de conexão.");
      setStatus(previousStatus);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="relative">
      <select
        value={status}
        disabled={isUpdating}
        onChange={(e) => handleChange(e.target.value as JobStatus)}
        className="rounded-md border border-[#2A2D3A] bg-[#1A1B23] px-3 py-2 text-sm font-mono text-[#E4E6EB] focus:outline-none focus:ring-2 focus:ring-[#378ADD] disabled:opacity-50"
      >
        {Object.values(JobStatus).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      {toast && (
        <p className="absolute left-0 top-full mt-2 whitespace-nowrap font-mono text-xs text-[#378ADD]">
          {toast}
        </p>
      )}
    </div>
  );
}