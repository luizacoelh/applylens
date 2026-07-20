import { ExperienceLevel } from "@prisma/client";

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  ESTAGIO: "Estágio",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
  NAO_INFORMADO: "Não informado",
};
