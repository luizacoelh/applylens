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

// Compara as tecnologias exigidas pela vaga com as skills do perfil do
// usuário logado (UserProfile.skills). Comparação simples por normalização
// (case/acento-insensitive) — não é fuzzy match nem entende sinônimos (ex:
// "JS" não bate com "JavaScript"). Suficiente para o MVP.
//
// IMPORTANTE: `userSkills` deve vir sempre do perfil do usuário autenticado
// que está vendo a tela — nunca comparar com o perfil de outro usuário.
export function compareSkills(requiredTechnologies: string[], userSkills: string[]): SkillGapResult {
  const knownNormalized = new Set(userSkills.map(normalize));

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
