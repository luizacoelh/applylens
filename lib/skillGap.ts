import { MY_SKILLS } from "@/lib/skills";

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove acentos
}

export interface SkillGapResult {
  known: string[];
  missing: string[];
}

// Compara as tecnologias exigidas pela vaga com a lista MY_SKILLS.
// Comparação simples por normalização (case/acento-insensitive) — não é
// fuzzy match nem entende sinônimos (ex: "JS" não bate com "JavaScript").
// Suficiente para o MVP; se a lista de tecnologias tiver muitos "quase
// iguais" no seu caso, ajuste os nomes em lib/skills.ts para bater exato.
export function compareSkills(requiredTechnologies: string[]): SkillGapResult {
  const knownNormalized = new Set(MY_SKILLS.map(normalize));

  const known: string[] = [];
  const missing: string[] = [];

  for (const tech of requiredTechnologies) {
    if (knownNormalized.has(normalize(tech))) {
      known.push(tech);
    } else {
      missing.push(tech);
    }
  }

  return { known, missing };
}
