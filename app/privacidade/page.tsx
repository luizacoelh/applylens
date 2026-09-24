import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen text-[#E4E6EB] px-4 py-16">
      <div className="studio-backdrop">
        <div className="studio-glow" style={{ width: 400, height: 400, top: -120, left: -100, background: "radial-gradient(circle, rgba(55,138,221,0.35), transparent 70%)" }} />
        <div className="studio-glow" style={{ width: 320, height: 320, bottom: -120, right: -80, background: "radial-gradient(circle, rgba(133,183,235,0.2), transparent 70%)" }} />
      </div>

      <div className="mx-auto max-w-2xl">
        <Link
          href="/login"
          className="text-sm text-[#85B7EB] hover:text-[#378ADD]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          ← Voltar
        </Link>

        {/* Wordmark */}
        <div className="flex items-center gap-2 mt-6 mb-4">
          <span
            className="h-[18px] w-[18px] rounded-[6px] shrink-0"
            style={{
              background: "linear-gradient(155deg, #85B7EB, #378ADD)",
              boxShadow: "0 0 10px rgba(55,138,221,0.5), inset 0 1px 1px rgba(255,255,255,0.45)",
            }}
          />
          <span
            className="text-sm font-semibold text-[#85B7EB]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            ApplyLens
          </span>
        </div>

        <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
          Política de Privacidade
        </h1>
        <p className="text-xs text-[#7C8494] mb-10">Última atualização: julho de 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-[#C4C7D0]">
          <section>
            <h2
              className="mb-3 text-xs font-medium uppercase tracking-wide text-[#7C8494]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              O que coletamos
            </h2>
            <p>
              Ao entrar com Google ou GitHub, recebemos seu nome, e-mail e foto de perfil públicos
              dessas plataformas, usados apenas para identificar sua conta dentro do ApplyLens.
              As vagas que você cadastra (empresa, cargo, descrição, e a análise gerada por IA)
              ficam associadas à sua conta e visíveis apenas para você.
            </p>
          </section>

          <section>
            <h2
              className="mb-3 text-xs font-medium uppercase tracking-wide text-[#7C8494]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Como usamos a IA
            </h2>
            <p>
              O texto da vaga que você cola é enviado à API do Google Gemini para gerar o resumo,
              tecnologias, requisitos, perguntas e checklist. Esse envio segue os termos de uso e
              privacidade do próprio Google para a Gemini API — o ApplyLens não armazena esse
              texto em nenhum serviço além do banco de dados do projeto.
            </p>
          </section>

          <section>
            <h2
              className="mb-3 text-xs font-medium uppercase tracking-wide text-[#7C8494]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Cookies e sessão
            </h2>
            <p>
              Usamos apenas cookies de sessão para manter você autenticado(a). Nenhum cookie de
              rastreamento ou publicidade é utilizado.
            </p>
          </section>

          <section>
            <h2
              className="mb-3 text-xs font-medium uppercase tracking-wide text-[#7C8494]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Seus dados
            </h2>
            <p>
              Não compartilhamos suas informações com terceiros além do Google Gemini (para análise
              das vagas). Você pode excluir qualquer vaga cadastrada a qualquer momento. Se quiser
              remover sua conta completamente, entre em contato.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
