import { Reveal } from "@/components/ui/Reveal";
import { values } from "@/lib/site";

export function Values() {
  return (
    <section id="clinica" className="section section-mist">
      <div className="shell grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <p className="label label-sage">A clínica</p>
            <h2 className="display section-title mt-4 text-ink">
              Terapia como ela deveria ser: humana e sem complicação
            </h2>
            <p className="lede mt-5 max-w-md">
              A ALENTO nasceu para tirar a distância entre quem precisa de ajuda e quem
              pode oferecê-la. Reunimos psicólogos de diferentes abordagens num só lugar,
              com um jeito simples de marcar e acompanhar suas sessões.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {values.map((value, index) => (
            <Reveal key={value.title} delay={index * 90}>
              <article className="card h-full p-7">
                <span className="font-serif text-[2rem] text-sage">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-[17px] font-medium text-ink">{value.title}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-graphite">{value.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
