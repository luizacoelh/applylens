import { JobLocation } from "@prisma/client";

export const LOCATION_LABELS: Record<JobLocation, string> = {
  REMOTO: "Remoto",
  HIBRIDO: "Híbrido",
  PRESENCIAL: "Presencial",
  NAO_INFORMADO: "Não informado",
};
