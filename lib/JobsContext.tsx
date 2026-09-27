"use client";

// Contexto global de jobs no cliente.
//
// O problema que isso resolve:
// O dashboard já recebe TODOS os dados de todas as vagas do servidor.
// Quando o usuário clica num card, o Next.js navega para /vaga/[id] —
// um Server Component que vai buscar O MESMO dado no Turso de novo.
// Isso causa o loading.tsx aparecer desnecessariamente.
//
// Com esse contexto:
// 1. O dashboard popula o store com todos os jobs
// 2. Ao clicar num card, VagaDetalhesPage lê do store instantaneamente
// 3. O servidor ainda confirma os dados em background (ver uso no page.tsx)
// 4. O usuário nunca vê o skeleton em transições dashboard → vaga

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Job } from "@/types/job";

interface JobsContextValue {
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  getJob: (id: string) => Job | undefined;
  updateJob: (id: string, patch: Partial<Job>) => void;
}

const JobsContext = createContext<JobsContextValue | null>(null);

export function JobsProvider({ children, initialJobs }: { children: ReactNode; initialJobs: Job[] }) {
  const [jobs, setJobsState] = useState<Job[]>(initialJobs);

  const setJobs = useCallback((newJobs: Job[]) => {
    setJobsState(newJobs);
  }, []);

  const getJob = useCallback((id: string) => {
    return jobs.find((j) => j.id === id);
  }, [jobs]);

  // Usado pelo StatusSelect e JobMetaEditor para atualizar o cache local
  // sem precisar revalidar toda a lista do servidor
  const updateJob = useCallback((id: string, patch: Partial<Job>) => {
    setJobsState((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...patch } : j))
    );
  }, []);

  return (
    <JobsContext.Provider value={{ jobs, setJobs, getJob, updateJob }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs deve ser usado dentro de JobsProvider");
  return ctx;
}
