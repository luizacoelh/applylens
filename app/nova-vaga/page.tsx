"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobAnalysis, JobLocation } from "@/types/job";
import { LOCATION_LABELS } from "@/lib/jobLocation";
import DetailSection from "@/components/ui/DetailSection";
import TechBadge from "@/components/ui/TechBadge";
import ChecklistItem from "@/components/job/ChecklistItem";

type Step = "input" | "preview";

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NovaVagaPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("input");
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);

  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState<JobLocation>("NAO_INFORMADO");
  const [salary, setSalary] = useState("");
  const [appliedAt, setAppliedAt] = useState(todayInputValue());

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setError(null);

    if (description.trim().length < 20) {
      setError("Cole a descrição completa da vaga (texto muito curto).");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Não foi possível analisar a vaga.");
        return;
      }

      setAnalysis(data as JobAnalysis);
      setCompany(data.company);
      setTitle(data.title);
      setSummary(data.summary);
      setStep("preview");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleSave() {
    if (!analysis) return;
    setError(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          company,
          title,
          summary,
          requirements: analysis.requirements,
          technologies: analysis.technologies,
          questions: analysis.questions,
          checklist: analysis.checklist,
          url: url.trim() === "" ? undefined : url.trim(),
          location,
          salary: salary.trim() === "" ? undefined : salary.trim(),
          appliedAt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar a vaga.");
        return;
      }

      router.push(`/vaga/${data.id}?created=true`);
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleBack() {
    setStep("input");
    setAnalysis(null);
    setCompany("");
    setTitle("");
    setSummary("");
    setUrl("");
    setLocation("NAO_INFORMADO");
    setSalary("");
    setAppliedAt(todayInputValue());
    setError(null);
  }

  return (
    <main className="min-h-screen bg-[#111218] text-[#E4E6EB] flex justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <p className="font-mono text-sm text-[#378ADD] mb-2">
          Nova vaga · Etapa {step === "input" ? "1" : "2"}/2
        </p>
        <h1 className="text-2xl font-semibold mb-8">
          {step === "input" ? "Adicionar vaga" : "Confirmar análise"}
        </h1>

        {error && (
          <div className="mb-6 rounded-md border border-[#E5534B]/40 bg-[#E5534B]/10 px-4 py-3 text-sm text-[#E5534B]">
            {error}
          </div>
        )}

        {step === "input" && (
          <div className="rounded-lg border border-[#2A2D3A] bg-[#1A1B23] p-6">
            <label htmlFor="description" className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">
              Descrição da vaga
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cole aqui o texto completo da vaga..."
              rows={12}
              className="mt-2 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-4 py-3 text-sm text-[#E4E6EB] placeholder:text-[#4B4F5C] focus:outline-none focus:ring-2 focus:ring-[#378ADD] resize-none"
            />

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="mt-4 w-full rounded-md bg-[#378ADD] py-3 font-medium text-white transition-colors hover:bg-[#4FA0F0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing ? "Analisando..." : "Analisar"}
            </button>
          </div>
        )}

        {step === "preview" && analysis && (
          <div className="space-y-4">
            <div className="rounded-lg border border-[#2A2D3A] bg-[#1A1B23] p-6 space-y-4">
              <div>
                <label htmlFor="company" className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">
                  Empresa
                </label>
                <input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-2 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
                />
              </div>

              <div>
                <label htmlFor="title" className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">
                  Cargo
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
                />
              </div>

              <div>
                <label htmlFor="summary" className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">
                  Resumo
                </label>
                <textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-4 py-2 text-sm text-[#C4C7D0] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#378ADD] resize-none"
                />
              </div>

              <div>
                <label htmlFor="url" className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">
                  Link da vaga (opcional)
                </label>
                <input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-2 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="location" className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">
                    Local
                  </label>
                  <select
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value as JobLocation)}
                    className="mt-2 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
                  >
                    {Object.entries(LOCATION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="salary" className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">
                    Salário
                  </label>
                  <input
                    id="salary"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="Não informado"
                    className="mt-2 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
                  />
                </div>

                <div>
                  <label htmlFor="appliedAt" className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">
                    Data da candidatura
                  </label>
                  <input
                    id="appliedAt"
                    type="date"
                    value={appliedAt}
                    onChange={(e) => setAppliedAt(e.target.value)}
                    className="mt-2 w-full rounded-md border border-[#2A2D3A] bg-[#111218] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
                  />
                </div>
              </div>

              <DetailSection label="Tecnologias">
                <div className="flex flex-wrap gap-2">
                  {analysis.technologies.map((tech) => (
                    <TechBadge key={tech} tech={tech} />
                  ))}
                </div>
              </DetailSection>

              <DetailSection label="Requisitos">
                <ul className="space-y-1 text-sm text-[#C4C7D0]">
                  {analysis.requirements.map((req, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#378ADD]">–</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </DetailSection>

              <DetailSection label="Perguntas prováveis">
                <ul className="space-y-1 text-sm text-[#C4C7D0]">
                  {analysis.questions.map((q, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#378ADD]">?</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </DetailSection>

              <DetailSection label="Checklist">
                <ul className="space-y-1">
                  {analysis.checklist.map((item, i) => (
                    <ChecklistItem key={i} text={item} />
                  ))}
                </ul>
              </DetailSection>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                disabled={isSaving}
                className="flex-1 rounded-md border border-[#2A2D3A] py-3 font-medium text-[#C4C7D0] transition-colors hover:bg-[#1A1B23] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 rounded-md bg-[#378ADD] py-3 font-medium text-white transition-colors hover:bg-[#4FA0F0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Salvando..." : "Salvar vaga"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
