"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <main className="min-h-screen bg-[#111218] text-[#E4E6EB] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-sm text-[#E5534B] mb-2">$ erro --inesperado</p>
        <h1 className="text-xl font-semibold mb-2">Algo deu errado.</h1>
        <p className="text-sm text-[#7C8494] mb-6">
          Ocorreu um erro inesperado ao carregar esta página. Isso já foi registrado no console do
          servidor.
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-[#378ADD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4FA0F0]"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
