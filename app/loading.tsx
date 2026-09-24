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
        {/* Header skeleton — espelha o layout do Dashboard */}
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            {/* Wordmark */}
            <div className="flex items-center gap-2">
              <div
                className="h-[22px] w-[22px] rounded-[7px]"
                style={{
                  background: "linear-gradient(155deg, rgba(133,183,235,0.3), rgba(55,138,221,0.3))",
                }}
              />
              <div className="h-4 w-20 rounded-lg bg-white/8" />
            </div>
            <div className="h-7 w-48 rounded-lg bg-white/8" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-24 rounded-xl bg-white/6" />
            <div className="h-9 w-28 rounded-xl bg-white/10" />
            {/* Avatar skeleton */}
            <div className="h-8 w-8 rounded-full bg-white/8" />
          </div>
        </div>

        {/* Stats bar skeleton */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
            />
          ))}
        </div>

        {/* Filter bar skeleton */}
        <div className="mb-5 flex gap-2">
          <div className="h-9 w-48 rounded-xl bg-white/6" />
          <div className="h-9 w-28 rounded-xl bg-white/6" />
          <div className="h-9 w-28 rounded-xl bg-white/6" />
        </div>

        {/* Cards skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl"
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
