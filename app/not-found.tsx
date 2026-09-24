import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen text-[#E4E6EB] flex items-center justify-center px-4">
      <div className="studio-backdrop">
        <div className="studio-glow" style={{ width: 400, height: 400, top: "10%", left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle, rgba(55,138,221,0.35), transparent 70%)" }} />
      </div>

      <div className="max-w-md text-center">
        {/* Wordmark */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span
            className="h-[20px] w-[20px] rounded-[6px]"
            style={{
              background: "linear-gradient(155deg, #85B7EB, #378ADD)",
              boxShadow: "0 0 12px rgba(55,138,221,0.55), inset 0 1px 1px rgba(255,255,255,0.5)",
            }}
          />
          <span
            className="text-[15px] font-semibold"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            ApplyLens
          </span>
        </div>

        <p
          className="text-4xl font-semibold text-[#378ADD] mb-3"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          404
        </p>
        <h1
          className="text-xl font-semibold mb-2"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Página não encontrada.
        </h1>
        <p className="text-sm text-[#7C8494] mb-8">
          A vaga ou página que você está procurando não existe ou foi removida.
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-[#378ADD] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4FA0F0]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          ← Voltar ao Dashboard
        </Link>
      </div>
    </main>
  );
}
