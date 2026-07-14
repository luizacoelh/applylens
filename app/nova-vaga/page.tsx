"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobAnalysis } from "@/types/job";

type Step = "input" | "preview";

export default function NovaVagaPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("input");
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar a vaga.");
        return;
      }

      router.push(`/vaga/${data.id}`);
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
    setError(null);
  }

  return (
    <main className="min-h-screen bg-[#111218] text-[#E4E6EB] flex justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <p className="font-mono text-sm text-[#378ADD] mb-2">
          $ nova-vaga --step {step === "input" ? "1" : "2"}/2
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

              <PreviewSection label="Tecnologias">
                <div className="flex flex-wrap gap-2">
                  {analysis.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-[#378ADD]/40 bg-[#378ADD]/10 px-3 py-1 font-mono text-xs text-[#378ADD]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </PreviewSection>

              <PreviewSection label="Requisitos">
                <ul className="space-y-1 text-sm text-[#C4C7D0]">
                  {analysis.requirements.map((req, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#378ADD]">–</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </PreviewSection>

              <PreviewSection label="Perguntas prováveis">
                <ul className="space-y-1 text-sm text-[#C4C7D0]">
                  {analysis.questions.map((q, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#378ADD]">?</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </PreviewSection>

              <PreviewSection label="Checklist">
                <ul className="space-y-1 text-sm text-[#C4C7D0]">
                  {analysis.checklist.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#378ADD]">□</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </PreviewSection>
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

function PreviewSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[#2A2D3A] pt-4">
      <p className="font-mono text-xs text-[#7C8494] uppercase tracking-wide mb-2">{label}</p>
      {children}
    </div>
  );
}