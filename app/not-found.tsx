import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#111218] text-[#E4E6EB] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-sm text-[#378ADD] mb-2">$ 404 --not-found</p>
        <h1 className="text-xl font-semibold mb-2">Página não encontrada.</h1>
        <p className="text-sm text-[#7C8494] mb-6">
          A vaga ou página que você está procurando não existe ou foi removida.
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-[#378ADD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4FA0F0]"
        >
          ← Voltar ao Dashboard
        </Link>
      </div>
    </main>
  );
}
