"use client";

import { JobStatus, JobLocation } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/jobStatus";
import { LOCATION_LABELS } from "@/lib/jobLocation";

export interface FilterState {
  search: string;
  status: JobStatus | "TODOS";
  location: JobLocation | "TODOS";
  tech: string | "TODAS";
}

export default function FilterBar({
  filters,
  onChange,
  availableTechs,
  view,
  onViewChange,
}: {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableTechs: string[];
  view: "cards" | "table";
  onViewChange: (view: "cards" | "table") => void;
}) {
  const hasActiveFilters =
    filters.search !== "" || filters.status !== "TODOS" || filters.location !== "TODOS" || filters.tech !== "TODAS";

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Pesquisar por empresa, cargo ou tecnologia..."
          className="w-full rounded-md border border-[#2A2D3A] bg-[#1A1B23] px-4 py-2 text-sm text-[#E4E6EB] placeholder:text-[#4B4F5C] focus:outline-none focus:ring-2 focus:ring-[#378ADD] sm:flex-1"
        />

        <div className="flex shrink-0 gap-1 rounded-md border border-[#2A2D3A] p-1">
          <button
            onClick={() => onViewChange("cards")}
            className={`rounded px-3 py-1 text-xs font-mono transition-colors ${
              view === "cards" ? "bg-[#378ADD] text-white" : "text-[#7C8494] hover:text-[#E4E6EB]"
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => onViewChange("table")}
            className={`rounded px-3 py-1 text-xs font-mono transition-colors ${
              view === "table" ? "bg-[#378ADD] text-white" : "text-[#7C8494] hover:text-[#E4E6EB]"
            }`}
          >
            Tabela
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as FilterState["status"] })}
          className="rounded-md border border-[#2A2D3A] bg-[#1A1B23] px-3 py-2 text-xs font-mono text-[#C4C7D0] focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
        >
          <option value="TODOS">Todos os status</option>
          {Object.values(JobStatus).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <select
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value as FilterState["location"] })}
          className="rounded-md border border-[#2A2D3A] bg-[#1A1B23] px-3 py-2 text-xs font-mono text-[#C4C7D0] focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
        >
          <option value="TODOS">Todos os locais</option>
          {Object.values(JobLocation).map((l) => (
            <option key={l} value={l}>
              {LOCATION_LABELS[l]}
            </option>
          ))}
        </select>

        <select
          value={filters.tech}
          onChange={(e) => onChange({ ...filters, tech: e.target.value })}
          className="rounded-md border border-[#2A2D3A] bg-[#1A1B23] px-3 py-2 text-xs font-mono text-[#C4C7D0] focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
        >
          <option value="TODAS">Todas as tecnologias</option>
          {availableTechs.map((tech) => (
            <option key={tech} value={tech}>
              {tech}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => onChange({ search: "", status: "TODOS", location: "TODOS", tech: "TODAS" })}
            className="text-xs font-mono text-[#378ADD] hover:text-[#4FA0F0]"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
