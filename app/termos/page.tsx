import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/site/PublicShell";
import { clinic } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: "Condições de uso do site e dos serviços de agendamento da ALENTO.",
  alternates: { canonical: "/termos" },
};

export default function TermosPage() {
  return (
    <PublicShell>
      <section className="section section-mist pb-12">
        <div className="shell">
          <p className="label label-sage">Institucional</p>
          <h1 className="display mt-4 text-[clamp(2rem,4.4vw,3rem)] text-ink">Termos de uso</h1>
          <p className="lede mt-3">Última atualização: {new Date().getFullYear()}.</p>
        </div>
      </section>

      <section className="section pt-10">
        <div className="shell max-w-3xl">
          <div className="space-y-8 text-[15px] leading-relaxed text-graphite">
            <p>
              Ao usar este site e agendar uma sessão, você concorda com os termos abaixo. O serviço é
              oferecido pela {clinic.legal}.
            </p>

            <div>
              <h2 className="text-[19px] font-medium text-ink">1. Conta</h2>
              <p className="mt-3">
                Você é responsável por manter a confidencialidade da sua senha e pelas informações
                fornecidas no cadastro, que devem ser verdadeiras e atualizadas.
              </p>
            </div>

            <div>
              <h2 className="text-[19px] font-medium text-ink">2. Agendamento e cancelamento</h2>
              <p className="mt-3">
                O agendamento é uma solicitação de horário com o profissional escolhido. Você pode
                remarcar ou cancelar pela sua conta. Recomendamos avisar com antecedência quando
                possível, para liberar o horário a outras pessoas.
              </p>
            </div>

            <div>
              <h2 className="text-[19px] font-medium text-ink">3. Pagamento</h2>
              <p className="mt-3">
                O valor da sessão é combinado diretamente com o profissional, conforme indicado no
                perfil de cada psicólogo. Este site não processa pagamentos no momento.
              </p>
            </div>

            <div>
              <h2 className="text-[19px] font-medium text-ink">4. Natureza do serviço</h2>
              <p className="mt-3">
                Este site não substitui atendimento de emergência. Em situações de crise, ligue 188
                (CVV) ou 192 (SAMU), ou procure o serviço de emergência mais próximo.
              </p>
            </div>

            <div>
              <h2 className="text-[19px] font-medium text-ink">5. Privacidade</h2>
              <p className="mt-3">
                O tratamento dos seus dados é descrito na nossa{" "}
                <Link href="/privacidade" className="link-sage text-ink">
                  Política de privacidade
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="text-[19px] font-medium text-ink">6. Contato</h2>
              <p className="mt-3">
                Fale com a gente em{" "}
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
