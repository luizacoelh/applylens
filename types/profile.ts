import { ExperienceLevel } from "@prisma/client";

export type { ExperienceLevel };

export interface UserProfile {
  goal: string | null;
  interestArea: string | null;
  experience: ExperienceLevel;
  skills: string[];
}

// Body aceito por PUT /api/profile — todos os campos opcionais, mas o
// formulário em /perfil sempre envia os quatro.
export interface UpdateProfileRequest {
  goal?: string;
  interestArea?: string;
  experience?: ExperienceLevel;
  skills?: string[];
}
