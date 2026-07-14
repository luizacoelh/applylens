export default function Loading() {
  return (
    <main className="min-h-screen bg-[#111218] text-[#E4E6EB] px-4 py-16">
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="mb-8 h-8 w-64 rounded bg-[#1A1B23]" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg border border-[#2A2D3A] bg-[#1A1B23]" />
          ))}
        </div>
      </div>
    </main>
  );
}
