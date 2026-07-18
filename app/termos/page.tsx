import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#111218] text-[#E4E6EB] px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/login" className="font-mono text-sm text-[#378ADD] hover:text-[#4FA0F0]">
          ← Voltar
        </Link>

        <h1 className="mt-6 text-2xl font-semibold">Termos de Uso</h1>
        <p className="mt-1 text-xs text-[#7C8494]">Última atualização: julho de 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#C4C7D0]">
          <section>
            <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-[#7C8494]">
              O que é o ApplyLens
            </h2>
            <p>
              O ApplyLens é uma ferramenta para organizar candidaturas de emprego, usando IA para
              analisar descrições de vagas. É oferecido "como está", sem garantias de
              disponibilidade contínua.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-[#7C8494]">
              Uso aceitável
            </h2>
            <p>
              Não use o ApplyLens para enviar conteúdo ilegal, malicioso ou abusivo à API de
              análise por IA, nem para tentar contornar os limites de uso configurados. Contas que
              abusarem do serviço podem ter o acesso suspenso.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-[#7C8494]">
              Limites da análise por IA
            </h2>
            <p>
              As informações extraídas pela IA (resumo, tecnologias, requisitos, perguntas,
              checklist) são geradas automaticamente e podem conter imprecisões. Sempre confira os
              dados importantes (como requisitos e prazos) na fonte original da vaga.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-[#7C8494]">
              Sem garantias
            </h2>
            <p>
              O serviço é fornecido sem garantias de qualquer tipo. Não nos responsabilizamos por
              decisões tomadas com base nas informações geradas pela IA, nem por perda de dados.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-[#7C8494]">
              Alterações
            </h2>
            <p>
              Este documento pode ser atualizado conforme o projeto evolui. O uso contínuo do
              serviço após uma alteração implica concordância com os novos termos.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
