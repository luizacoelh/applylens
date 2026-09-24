"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobAnalysis, JobLocation } from "@/types/job";
import { LOCATION_LABELS } from "@/lib/jobLocation";
import DetailSection from "@/components/ui/DetailSection";
import TechBadge from "@/components/ui/TechBadge";
import ChecklistItem from "@/components/job/ChecklistItem";
import GlassPanel from "@/components/ui/Glass";

type Step = "input" | "preview";

// Mesmo limite validado no servidor (app/api/analyze/route.ts) — aqui é só
// pra dar feedback imediato, o servidor sempre revalida.
const MAX_DESCRIPTION_LENGTH = 8000;

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

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setError(`Descrição muito longa (${description.length}/${MAX_DESCRIPTION_LENGTH} caracteres).`);
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
    <main className="min-h-screen text-[#E4E6EB] flex justify-center px-4 py-16">
      <div className="studio-backdrop">
        <div className="studio-glow" style={{ width: 480, height: 480, top: -140, left: -120, background: "radial-gradient(circle, rgba(55,138,221,0.5), transparent 70%)" }} />
        <div className="studio-glow" style={{ width: 420, height: 420, bottom: -160, right: -100, background: "radial-gradient(circle, rgba(133,183,235,0.3), transparent 70%)" }} />
      </div>

      <div className="w-full max-w-2xl">
        <p className="text-sm text-[#85B7EB] mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
          Nova vaga · Etapa {step === "input" ? "1" : "2"}/2
        </p>
        <h1 className="text-2xl font-semibold mb-8" style={{ fontFamily: "var(--font-outfit)" }}>
          {step === "input" ? "Adicionar vaga" : "Confirmar análise"}
        </h1>

        {error && (
          <div className="mb-6 rounded-xl border border-[#E5534B]/40 bg-[#E5534B]/10 px-4 py-3 text-sm text-[#E5534B]">
            {error}
          </div>
        )}

        {step === "input" && (
          <GlassPanel plateClassName="p-6">
            <label htmlFor="description" className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">
              Descrição da vaga
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cole aqui o texto completo da vaga..."
              rows={12}
              maxLength={MAX_DESCRIPTION_LENGTH}
              className="glass-input mt-2 w-full rounded-xl px-4 py-3 text-sm text-[#E4E6EB] placeholder:text-[#4B4F5C] resize-none"
            />
            <p className="mt-1 text-right text-xs text-[#7C8494]">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </p>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="mt-4 w-full rounded-xl py-3 font-medium text-[#08131F] transition-shadow disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                fontFamily: "var(--font-outfit)",
                background: "linear-gradient(155deg, #85B7EB, #378ADD)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.25) inset, 0 8px 20px -8px rgba(55,138,221,0.6)",
              }}
            >
              {isAnalyzing ? "Analisando..." : "Analisar"}
            </button>
          </GlassPanel>
        )}

        {step === "preview" && analysis && (
          <div className="space-y-4">
            <GlassPanel plateClassName="p-6 space-y-4">
              <div>
                <label htmlFor="company" className="font-mono text-xs text-[#7C8494] uppercase tracking-wide">
                  Empresa
                </label>
                <input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="glass-input mt-2 w-full rounded-xl px-4 py-2 text-sm"
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
                  className="glass-input mt-2 w-full rounded-xl px-4 py-2 text-sm"
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
                  className="glass-input mt-2 w-full rounded-xl px-4 py-2 text-sm text-[#C4C7D0] leading-relaxed resize-none"
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
                  className="glass-input mt-2 w-full rounded-xl px-4 py-2 text-sm"
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
                    className="glass-input mt-2 w-full rounded-xl px-3 py-2 text-sm"
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
                    className="glass-input mt-2 w-full rounded-xl px-3 py-2 text-sm"
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
                    className="glass-input mt-2 w-full rounded-xl px-3 py-2 text-sm"
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
            </GlassPanel>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                disabled={isSaving}
                className="glass-btn flex-1 rounded-xl py-3 font-medium text-[#C4C7D0] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Voltar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 rounded-xl py-3 font-medium text-[#08131F] transition-shadow disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  fontFamily: "var(--font-outfit)",
                  background: "linear-gradient(155deg, #85B7EB, #378ADD)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.25) inset, 0 8px 20px -8px rgba(55,138,221,0.6)",
                }}
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
