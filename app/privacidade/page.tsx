import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/site/PublicShell";
import { clinic } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Como a ALENTO coleta, usa e protege os seus dados pessoais, em conformidade com a LGPD.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacidadePage() {
  return (
    <PublicShell>
      <section className="section section-mist pb-12">
        <div className="shell">
          <p className="label label-sage">Institucional</p>
          <h1 className="display mt-4 text-[clamp(2rem,4.4vw,3rem)] text-ink">
            Política de privacidade
          </h1>
          <p className="lede mt-3">Última atualização: {new Date().getFullYear()}.</p>
        </div>
      </section>

      <section className="section pt-10">
        <div className="shell max-w-3xl">
          <div className="space-y-8 text-[15px] leading-relaxed text-graphite">
            <p>
              Esta política explica, de forma simples, como a {clinic.legal} trata os seus dados
              pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 —
              LGPD).
            </p>

            <div>
              <h2 className="text-[19px] font-medium text-ink">1. Quais dados coletamos</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-ink">Dados de cadastro:</strong> nome, e-mail e,
                  opcionalmente, telefone.
                </li>
                <li>
                  <strong className="text-ink">Dados de uso:</strong> sessões agendadas, psicólogo
                  escolhido, modalidade e observações que você registra ao agendar.
                </li>
                <li>
                  <strong className="text-ink">Dados técnicos:</strong> informações de acesso
                  necessárias para manter a segurança do site (como endereço IP e cookies de
                  sessão).
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-[19px] font-medium text-ink">2. Para que usamos</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Criar e gerenciar a sua conta e permitir que você agende, remarque e cancele sessões.</li>
                <li>Enviar avisos operacionais sobre as suas consultas.</li>
                <li>Cumprir obrigações legais e regulatórias aplicáveis.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[19px] font-medium text-ink">3. Sigilo profissional</h2>
              <p className="mt-3">
                O conteúdo das sessões é protegido pelo sigilo profissional previsto no Código de
                Ética do Psicólogo. Este sigilo só é afastado nas hipóteses previstas em lei, como
                risco iminente à vida.
              </p>
            </div>

            <div>
              <h2 className="text-[19px] font-medium text-ink">4. Compartilhamento</h2>
              <p className="mt-3">
                Não vendemos os seus dados. Compartilhamos apenas o necessário com os profissionais
                que você escolher e com fornecedores que viabilizam o serviço (por exemplo,
                hospedagem e banco de dados), sempre com contratos de confidencialidade.
              </p>
            </div>

            <div>
              <h2 className="text-[19px] font-medium text-ink">5. Seus direitos</h2>
              <p className="mt-3">
                Você pode, a qualquer momento, acessar, corrigir, exportar ou excluir os seus dados.
                Na sua{" "}
                <Link href="/minha-conta" className="link-sage text-ink">
                  conta
                </Link>
                , em <strong className="text-ink">Configurações</strong>, você pode baixar uma cópia
                dos seus dados ou excluir a sua conta e tudo o que estiver associado a ela.
              </p>
            </div>

            <div>
              <h2 className="text-[19px] font-medium text-ink">6. Retenção e segurança</h2>
              <p className="mt-3">
                Mantemos os dados apenas pelo tempo necessário às finalidades desta política ou para
                cumprir a lei. Adotamos medidas técnicas para proteger as informações, como conexão
                criptografada e armazenamento seguro das credenciais.
              </p>
            </div>

            <div>
              <h2 className="text-[19px] font-medium text-ink">7. Contato</h2>
              <p className="mt-3">
                Dúvidas sobre privacidade? Fale com a gente em{" "}
                <a href={`mailto:${clinic.email}`} className="link-sage text-ink">
                  {clinic.email}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
