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
        <Link href="/perfil" className="text-[#85B7EB] hover:text-[#378ADD]">
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
        Você já domina <span className="text-[#4ADE80] font-medium">{known.length}</span> de{" "}
        {technologies.length} tecnologias pedidas ({percentage}%).
      </p>
      <div className="flex flex-wrap gap-2">
        {known.map((tech) => (
          <span
            key={tech}
            className="glass-chip rounded-full border border-[#4ADE80]/40 bg-[#4ADE80]/10 px-3 py-1 font-mono text-xs text-[#4ADE80]"
          >
            ✔ {tech}
          </span>
        ))}
        {missing.map((tech) => (
          <span
            key={tech}
            className="glass-chip rounded-full border border-[#E5534B]/40 bg-[#E5534B]/10 px-3 py-1 font-mono text-xs text-[#E5534B]"
          >
            ✕ {tech}
          </span>
        ))}
      </div>
      {missing.length > 0 && (
        <p className="mt-3 text-xs text-[#7C8494]">
          Lista de skills desatualizada?{" "}
          <Link href="/perfil" className="text-[#85B7EB] hover:text-[#378ADD]">
            Edite seu perfil
          </Link>
          .
        </p>
      )}
    </div>
  );
}
