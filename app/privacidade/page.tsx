import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#111218] text-[#E4E6EB] px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/login" className="font-mono text-sm text-[#378ADD] hover:text-[#4FA0F0]">
          ← Voltar
        </Link>

        <h1 className="mt-6 text-2xl font-semibold">Política de Privacidade</h1>
        <p className="mt-1 text-xs text-[#7C8494]">Última atualização: julho de 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#C4C7D0]">
          <section>
            <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-[#7C8494]">
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
            <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-[#7C8494]">
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
            <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-[#7C8494]">
              Onde os dados ficam
            </h2>
            <p>
              Os dados são armazenados em um banco de dados (SQLite/Turso) operado como parte
              deste projeto. Não vendemos, compartilhamos ou usamos seus dados para publicidade.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-[#7C8494]">
              Exclusão de dados
            </h2>
            <p>
              Você pode excluir qualquer vaga individualmente pela tela de detalhes. Para excluir
              sua conta e todos os dados associados, entre em contato com quem administra esta
              instância do projeto.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-[#7C8494]">
              Projeto pessoal, não uma empresa
            </h2>
            <p>
              O ApplyLens é um projeto pessoal/portfólio, não uma empresa constituída. Este
              documento existe para deixar claro o que é feito com os dados, não como um
              instrumento jurídico formal de uma organização.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
