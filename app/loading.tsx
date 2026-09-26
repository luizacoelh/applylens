export default function Loading() {
  return (
    <main className="min-h-screen text-[#E4E6EB] px-4 py-10">
      <div className="studio-backdrop">
        <div
          className="studio-glow"
          style={{
            width: 560,
            height: 560,
            top: -220,
            left: -160,
            background: "radial-gradient(circle, rgba(55,138,221,0.5), transparent 70%)",
          }}
        />
        <div
          className="studio-glow"
          style={{
            width: 480,
            height: 480,
            top: "30%",
            right: -200,
            background: "radial-gradient(circle, rgba(133,183,235,0.3), transparent 70%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl animate-pulse">
        {/*
          Header — espelha exatamente o layout do Dashboard (app/page.tsx):
          flex-col gap-4 em mobile, flex-row em sm+.
          O desnívelamento anterior acontecia porque o skeleton usava
          flex-row fixo enquanto o dashboard real usa flex-col em mobile.
        */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Lado esquerdo: wordmark + título */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="h-[22px] w-[22px] shrink-0 rounded-[7px]"
                style={{
                  background: "linear-gradient(155deg, rgba(133,183,235,0.25), rgba(55,138,221,0.25))",
                }}
              />
              <div className="h-4 w-24 rounded-lg bg-white/8" />
            </div>
            <div className="h-7 w-44 rounded-lg bg-white/8" />
          </div>

          {/* Lado direito: ações + avatar */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-28 rounded-xl bg-white/6" />
            <div
              className="h-9 w-32 rounded-xl"
              style={{
                background: "linear-gradient(155deg, rgba(133,183,235,0.2), rgba(55,138,221,0.2))",
              }}
            />
            {/* Avatar */}
            <div className="h-8 w-8 shrink-0 rounded-full bg-white/8" />
          </div>
        </div>

        {/* Stats bar — 1 col mobile, 2 col sm+ (igual ao StatsBar real) */}
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-[22px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            />
          ))}
        </div>

        {/* Filter bar */}
        <div className="mb-5 flex flex-wrap gap-2">
          <div className="h-9 w-48 rounded-xl bg-white/6" />
          <div className="h-9 w-28 rounded-xl bg-white/6" />
          <div className="h-9 w-28 rounded-xl bg-white/6" />
        </div>

        {/* Job cards */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-[22px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                opacity: 1 - i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
