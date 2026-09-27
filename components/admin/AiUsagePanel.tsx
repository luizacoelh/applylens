import GlassPanel from "@/components/ui/Glass";

interface AiUsageByUser {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  totalCalls: number;
  totalTokens: number;
  lastUsedAt: Date | null;
}

interface AiUsageByDay {
  date: string;   // "YYYY-MM-DD"
  calls: number;
  tokens: number;
}

interface AiUsagePanelProps {
  byUser: AiUsageByUser[];
  byDay: AiUsageByDay[];
  totalCalls: number;
  totalTokens: number;
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default function AiUsagePanel({ byUser, byDay, totalCalls, totalTokens }: AiUsagePanelProps) {
  return (
    <div className="space-y-4">
      {/* Totais gerais */}
      <GlassPanel plateClassName="p-5">
        <p
          className="text-xs font-medium text-[#7C8494] uppercase tracking-wide mb-4"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Consumo de IA — visão geral
        </p>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
              {totalCalls.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-[#7C8494] mt-0.5">Chamadas totais</p>
          </div>
          <div>
            <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
              {formatTokens(totalTokens)}
            </p>
            <p className="text-xs text-[#7C8494] mt-0.5">Tokens processados (aprox.)</p>
          </div>
          <div>
            <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
              {byUser.length}
            </p>
            <p className="text-xs text-[#7C8494] mt-0.5">Usuários que usaram IA</p>
          </div>
        </div>
      </GlassPanel>

      {/* Por usuário */}
      <GlassPanel plateClassName="p-5">
        <p
          className="text-xs font-medium text-[#7C8494] uppercase tracking-wide mb-4"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Por usuário
        </p>
        {byUser.length === 0 ? (
          <p className="text-sm text-[#7C8494]">Nenhum uso registrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr
                  className="border-b border-white/8 text-left text-xs uppercase tracking-wide text-[#7C8494]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  <th className="px-3 py-2 font-medium">Usuário</th>
                  <th className="px-3 py-2 font-medium text-right">Chamadas</th>
                  <th className="px-3 py-2 font-medium text-right">Tokens (aprox.)</th>
                  <th className="px-3 py-2 font-medium">Último uso</th>
                </tr>
              </thead>
              <tbody>
                {byUser.map((u) => (
                  <tr key={u.userId} className="border-b border-white/5 last:border-0">
                    <td className="px-3 py-2.5">
                      <p className="text-[#E4E6EB]">{u.userName ?? "—"}</p>
                      <p className="text-xs text-[#7C8494]">{u.userEmail}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right text-[#C4C7D0]">
                      {u.totalCalls.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-3 py-2.5 text-right text-[#C4C7D0]">
                      {formatTokens(u.totalTokens)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[#7C8494]">
                      {u.lastUsedAt
                        ? new Date(u.lastUsedAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>

      {/* Por dia — últimos 14 dias */}
      <GlassPanel plateClassName="p-5">
        <p
          className="text-xs font-medium text-[#7C8494] uppercase tracking-wide mb-4"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Por dia — últimos 14 dias
        </p>
        {byDay.length === 0 ? (
          <p className="text-sm text-[#7C8494]">Nenhum uso nos últimos 14 dias.</p>
        ) : (
          <div className="space-y-2">
            {byDay.map((d) => {
              const maxCalls = Math.max(...byDay.map((x) => x.calls), 1);
              const pct = Math.round((d.calls / maxCalls) * 100);
              return (
                <div key={d.date} className="flex items-center gap-3">
                  <span
                    className="w-20 shrink-0 text-xs text-[#7C8494]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {formatDate(d.date)}
                  </span>
                  <div className="flex-1 h-5 rounded-lg overflow-hidden bg-white/5">
                    <div
                      className="h-full rounded-lg transition-all"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, rgba(55,138,221,0.6), rgba(133,183,235,0.8))",
                        minWidth: pct > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                  <span
                    className="w-20 shrink-0 text-right text-xs text-[#C4C7D0]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {d.calls} chamada{d.calls !== 1 ? "s" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
