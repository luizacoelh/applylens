import Link from "next/link";

export default function EmptyState({
  title = "Nenhuma vaga adicionada ainda.",
  subtitle = "Cole a descrição de uma vaga para começar a organizar suas candidaturas.",
  showCta = true,
}: {
  title?: string;
  subtitle?: string;
  showCta?: boolean;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[#2A2D3A] p-12 text-center">
      <p className="text-[#C4C7D0]">{title}</p>
      <p className="mt-1 text-sm text-[#7C8494]">{subtitle}</p>
      {showCta && (
        <Link
          href="/nova-vaga"
          className="mt-4 inline-block rounded-md bg-[#378ADD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4FA0F0]"
        >
          + Nova vaga
        </Link>
      )}
    </div>
  );
}
