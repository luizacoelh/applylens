// types/job.ts
import { JobStatus } from "@prisma/client";

export type { JobStatus };

// Contrato padronizado que qualquer provedor de IA deve retornar.
// Trocar Gemini por outro provedor no futuro não deve mudar este tipo.
export interface JobAnalysis {
  company: string;
  title: string;
  summary: string;
  requirements: string[];
  technologies: string[];
  questions: string[];
  checklist: string[];
}

// Modelo utilizado pela aplicação.
// Os campos JSON são convertidos de string para arrays
// após a leitura do banco.
// (no banco eles são strings, na aplicação são arrays).
export interface Job {
  id: string;
  company: string;
  title: string;
  description: string;
  status: JobStatus;
  summary: string | null;
  requirements: string[];
  technologies: string[];
  questions: string[];
  checklist: string[];
  createdAt: Date;
}

// Body esperado no POST /api/jobs (vaga já analisada, pronta pra salvar)
export interface CreateJobRequest {
  description: string;
  company: string;
  title: string;
  summary?: string;
  requirements: string[];
  technologies: string[];
  questions: string[];
  checklist: string[];
}