import Link from "next/link";

// Botão de navegação "voltar" no padrão vidro do app.
// Usado em todas as páginas internas (vaga, perfil, admin, etc.)
// no lugar do antigo link de texto simples.
export default function BackButton({
  href,
  label = "Dashboard",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="glass-btn inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-[#C4C7D0] transition-colors hover:text-[#E4E6EB]"
      style={{ fontFamily: "var(--font-outfit)" }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
        className="shrink-0 opacity-70"
      >
        <path
          d="M7.5 2L3.5 6L7.5 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </Link>
  );
}
