"use client";

import { useEffect } from "react";

// app/error.tsx só captura erros dentro das rotas — não cobre erros lançados
// pelo próprio layout raiz (app/layout.tsx). Para esse caso, o Next.js exige
// um app/global-error.tsx separado, que precisa renderizar sua própria tag
// <html>/<body> porque o layout raiz pode ser justamente a causa do erro.
// Por isso, os glows e o SVG de distorção são inline aqui — não dá pra
// depender do layout.tsx nem do globals.css carregado por ele.
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
      <body style={{ margin: 0, background: "#111218", color: "#E4E6EB", fontFamily: "system-ui, sans-serif" }}>
        {/* Filtro SVG de distorção — normalmente vem do layout.tsx, mas como
            esse arquivo substitui o layout inteiro, precisa ser declarado aqui. */}
        <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
          <defs>
            <filter id="glass-distort" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.018 0.022" numOctaves="3" seed="7" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>

        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 1rem", position: "relative" }}>
          {/* Glow de fundo — inline porque não temos globals.css disponível */}
          <div style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden", background: "radial-gradient(circle at 15% 0%, #12161f 0%, #111218 50%), #111218" }}>
            <div style={{ position: "absolute", width: 400, height: 400, top: "10%", left: "50%", transform: "translateX(-50%)", borderRadius: "50%", filter: "blur(70px)", opacity: 0.4, background: "radial-gradient(circle, rgba(229,83,75,0.3), transparent 70%)" }} />
          </div>

          <div style={{ maxWidth: 400, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 }}>
              <span style={{ height: 20, width: 20, borderRadius: 6, background: "linear-gradient(155deg, #85B7EB, #378ADD)", boxShadow: "0 0 12px rgba(55,138,221,0.55), inset 0 1px 1px rgba(255,255,255,0.5)", display: "inline-block" }} />
              <span style={{ fontSize: 15, fontWeight: 600 }}>ApplyLens</span>
            </div>

            <p style={{ fontSize: 13, color: "#E5534B", marginBottom: 12 }}>
              Erro crítico
            </p>
            <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              A aplicação encontrou um erro crítico.
            </h1>
            <p style={{ fontSize: 14, color: "#7C8494", marginBottom: 32 }}>
              Algo falhou ao carregar a estrutura básica da página. Tente recarregar.
            </p>
            <button
              onClick={reset}
              style={{ borderRadius: 12, background: "#378ADD", padding: "10px 20px", fontSize: 14, fontWeight: 500, color: "#fff", border: "none", cursor: "pointer" }}
            >
              Tentar novamente
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
