import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ApplyLens",
  description: "Organize suas candidaturas de emprego com ajuda de IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/*
          Filtro de refração usado por todo elemento .glass-surface do app
          (ver app/globals.css). Definido uma única vez aqui — qualquer
          .glass-surface em qualquer página referencia url(#glass-distort)
          no backdrop-filter. Fica invisível (0x0) e não afeta layout.
        */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <filter id="glass-distort" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves={2} seed={7} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        {children}
      </body>
    </html>
  );
}
