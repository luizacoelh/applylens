import Link from "next/link";
import { compareSkills } from "@/lib/skillGap";

export default function SkillCompatibility({
  technologies,
  userSkills,
}: {
  technologies: string[];
  userSkills: string[];
}) {
  if (technologies.length === 0) return null;

  if (userSkills.length === 0) {
    return (
      <p className="text-sm text-[#7C8494]">
        Adicione suas skills no{" "}
        <Link href="/perfil" className="text-[#378ADD] hover:text-[#4FA0F0]">
          seu perfil
        </Link>{" "}
        para ver a comparação com esta vaga.
      </p>
    );
  }

  const { known, missing } = compareSkills(technologies, userSkills);
  const percentage = Math.round((known.length / technologies.length) * 100);

  return (
    <div>
      <p className="mb-3 text-sm text-[#C4C7D0]">
        Você já domina <span className="text-[#3FB950] font-medium">{known.length}</span> de{" "}
        {technologies.length} tecnologias pedidas ({percentage}%).
      </p>
      <div className="flex flex-wrap gap-2">
        {known.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-[#3FB950]/40 bg-[#3FB950]/10 px-3 py-1 font-mono text-xs text-[#3FB950]"
          >
            ✔ {tech}
          </span>
        ))}
        {missing.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-[#E5534B]/40 bg-[#E5534B]/10 px-3 py-1 font-mono text-xs text-[#E5534B]"
          >
            ✕ {tech}
          </span>
        ))}
      </div>
      {missing.length > 0 && (
        <p className="mt-3 text-xs text-[#7C8494]">
          Lista de skills desatualizada?{" "}
          <Link href="/perfil" className="text-[#378ADD] hover:text-[#4FA0F0]">
            Edite seu perfil
          </Link>
          .
        </p>
      )}
    </div>
  );
}
