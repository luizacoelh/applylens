import { JobStatus } from "@prisma/client";

export const STATUS_LABELS: Record<JobStatus, string> = {
  APLICADA: "Aplicada",
  ENTREVISTA: "Entrevista",
  REPROVADA: "Reprovada",
  OFERTA: "Oferta",
};

export const STATUS_STYLES: Record<JobStatus, string> = {
  APLICADA: "border-[#378ADD]/40 bg-[#378ADD]/10 text-[#378ADD]",
  ENTREVISTA: "border-[#F0B429]/40 bg-[#F0B429]/10 text-[#F0B429]",
  REPROVADA: "border-[#E5534B]/40 bg-[#E5534B]/10 text-[#E5534B]",
  OFERTA: "border-[#3FB950]/40 bg-[#3FB950]/10 text-[#3FB950]",
};