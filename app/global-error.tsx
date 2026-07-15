"use client";

import { useEffect } from "react";

// app/error.tsx só captura erros dentro das rotas — não cobre erros lançados
// pelo próprio layout raiz (app/layout.tsx). Para esse caso, o Next.js exige
// um app/global-error.tsx separado, que precisa renderizar sua própria tag
// <html>/<body> porque o layout raiz pode ser justamente a causa do erro.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro crítico no layout raiz:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="bg-[#111218] text-[#E4E6EB]">
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <p className="font-mono text-sm text-[#E5534B] mb-2">$ erro --critico</p>
            <h1 className="text-xl font-semibold mb-2">A aplicação encontrou um erro crítico.</h1>
            <p className="text-sm text-[#7C8494] mb-6">
              Algo falhou ao carregar a estrutura básica da página. Tente recarregar.
            </p>
            <button
              onClick={reset}
              className="rounded-md bg-[#378ADD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4FA0F0]"
            >
              Tentar novamente
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
