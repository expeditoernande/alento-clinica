import type { Metadata } from "next";
import { PublicShell } from "@/components/site/PublicShell";
import { ApplicationForm } from "@/components/site/ApplicationForm";

export const metadata: Metadata = {
  title: "Quero atender",
  description:
    "É psicólogo e quer fazer parte da ALENTO? Envie seu currículo e nosso time de cuidado clínico entra em contato.",
};

const perks = [
  {
    title: "Agenda organizada",
    body: "A plataforma cuida dos agendamentos, lembretes e cancelamentos. Você foca no atendimento.",
  },
  {
    title: "Pacientes que chegam",
    body: "Trabalhamos a marca e o conteúdo da clínica para atrair pessoas que buscam terapia.",
  },
  {
    title: "Autonomia clínica",
    body: "Você define abordagem, valores e frequência. Nada de roteiro imposto por cima.",
  },
];

export default function QueroAtenderPage() {
  return (
    <PublicShell>
      <section className="section section-mist">
        <div className="shell grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div>
            <p className="label label-sage">Trabalhe com a gente</p>
            <h1 className="display mt-4 text-[clamp(2.1rem,4.8vw,3.4rem)] text-ink">
              É psicólogo? Tem lugar para o seu trabalho aqui.
            </h1>
            <p className="lede mt-5 max-w-md">
              Recebemos currículos de psicólogos com CRP ativo para atendimento online e
              presencial. Conte um pouco da sua trajetória — respondemos por e-mail.
            </p>

            <ul className="mt-10 space-y-6">
              {perks.map((item, index) => (
                <li key={item.title} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper font-serif text-sm text-sage">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[15px] font-medium text-ink">{item.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-graphite">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 md:p-9">
            <ApplicationForm />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
