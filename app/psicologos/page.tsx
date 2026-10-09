import type { Metadata } from "next";
import { PublicShell } from "@/components/site/PublicShell";
import { PsychologistDirectory } from "@/components/site/PsychologistDirectory";

export const metadata: Metadata = {
  title: "Psicólogos",
  description:
    "Conheça os psicólogos da ALENTO, suas abordagens, especialidades e valores. Filtre por atendimento online ou presencial e agende seu horário.",
};

export default function PsicologosPage() {
  return (
    <PublicShell>
      <section className="border-b border-line">
        <div className="shell py-16 md:py-20">
          <p className="label label-sage">Quem cuida</p>
          <h1 className="display mt-4 max-w-2xl text-[clamp(2.2rem,5vw,3.6rem)] text-ink">
            Escolha o psicólogo que faz sentido para você
          </h1>
          <p className="lede mt-5 max-w-xl">
            Todos com registro ativo no CRP e supervisão clínica. Filtre por abordagem ou
            modalidade (online e presencial) e agende em poucos cliques.
          </p>
        </div>
      </section>

      <section className="section pt-12 md:pt-14">
        <div className="shell">
          <PsychologistDirectory />
        </div>
      </section>
    </PublicShell>
  );
}
