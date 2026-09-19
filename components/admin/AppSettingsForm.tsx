"use client";

import { useState } from "react";
import { AppSettings } from "@/lib/appSettings";

export default function AppSettingsForm({ initialSettings }: { initialSettings: AppSettings }) {
  const [dailyAiLimit, setDailyAiLimit] = useState(String(initialSettings.dailyAiLimit));
  const [ipHourlyLimit, setIpHourlyLimit] = useState(String(initialSettings.ipHourlyLimit));
  const [maxDescriptionLength, setMaxDescriptionLength] = useState(
    String(initialSettings.maxDescriptionLength)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyAiLimit: Number(dailyAiLimit),
          ipHourlyLimit: Number(ipHourlyLimit),
          maxDescriptionLength: Number(maxDescriptionLength),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar.");
        return;
      }

      setToast("Configurações salvas — já valem para a próxima chamada, sem precisar de deploy.");
      setTimeout(() => setToast(null), 4000);
    } catch {
      setError("Falha de conexão.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-[#2A2D3A] bg-[#1A1B23] p-6 space-y-4">
      <p className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">Limites globais</p>

      {error && (
        <div className="rounded-md border border-[#E5534B]/40 bg-[#E5534B]/10 px-4 py-3 text-sm text-[#E5534B]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="dailyAiLimit" className="text-xs text-[#7C8494]">
            Análises de IA por usuário/dia
          </label>
          <input
            id="dailyAiLimit"
            type="number"
            min={1}
            value={dailyAiLimit}
            onChange={(e) => setDailyAiLimit(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
          />
        </div>

        <div>
          <label htmlFor="ipHourlyLimit" className="text-xs text-[#7C8494]">
            Análises por IP/hora
          </label>
          <input
            id="ipHourlyLimit"
            type="number"
            min={1}
            value={ipHourlyLimit}
            onChange={(e) => setIpHourlyLimit(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
          />
        </div>

        <div>
          <label htmlFor="maxDescriptionLength" className="text-xs text-[#7C8494]">
            Tamanho máx. da descrição (caracteres)
          </label>
          <input
            id="maxDescriptionLength"
            type="number"
            min={100}
            value={maxDescriptionLength}
            onChange={(e) => setMaxDescriptionLength(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-[#378ADD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4FA0F0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : "Salvar configurações"}
        </button>
        {toast && <span className="font-mono text-xs text-[#3FB950]">{toast}</span>}
      </div>
    </form>
  );
}
