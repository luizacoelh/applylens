import type { CSSProperties, ReactNode } from "react";

// Peça central do sistema de vidro do app — ver app/globals.css para as
// classes .glass-rim/.glass-surface/.glass-plate e a explicação de cada
// camada. Todo card, painel e chip do app deveria envolver seu conteúdo
// nisso em vez de recriar bg-[#1A1B23] + border + rounded na mão.
export default function GlassPanel({
  children,
  className = "",
  plateClassName = "p-5",
  radius = 22,
  hotspots = true,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string; // classes no wrapper externo (largura, margem, cursor, hover de container)
  plateClassName?: string; // classes no conteúdo interno (padding, flex, etc.)
  radius?: number; // px — cards grandes usam 22 (padrão), chips pequenos usam 12-14
  hotspots?: boolean; // pontos de luz concentrados na borda; desligue em elementos muito pequenos/repetidos se dois pontos de luz ficarem visualmente poluídos
  as?: "div" | "li";
}) {
  const style = { "--glass-radius": `${radius}px` } as CSSProperties;

  return (
    <Tag className={`glass-rim ${className}`} style={style}>
      {hotspots && (
        <>
          <span className="glass-hotspot glass-hotspot--tl" />
          <span className="glass-hotspot glass-hotspot--br" />
        </>
      )}
      <div className="glass-surface">
        <div className={`glass-plate ${plateClassName}`}>{children}</div>
      </div>
    </Tag>
  );
}
