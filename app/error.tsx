"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro não tratado na aplicação:", error);
  }, [error]);

  return (
    <main className="min-h-screen text-[#E4E6EB] flex items-center justify-center px-4">
      <div className="studio-backdrop">
        <div className="studio-glow" style={{ width: 400, height: 400, top: "10%", left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle, rgba(229,83,75,0.25), transparent 70%)" }} />
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
          className="text-sm text-[#E5534B] mb-3"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Algo deu errado
        </p>
        <h1
          className="text-xl font-semibold mb-2"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Erro inesperado.
        </h1>
        <p className="text-sm text-[#7C8494] mb-8">
          Ocorreu um erro ao carregar esta página. Isso já foi registrado no console do servidor.
        </p>
        <button
          onClick={reset}
          className="rounded-xl bg-[#378ADD] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4FA0F0]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
