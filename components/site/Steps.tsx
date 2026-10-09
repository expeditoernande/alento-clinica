import { Reveal } from "@/components/ui/Reveal";
import { steps } from "@/lib/site";

export function Steps() {
  return (
    <section id="como-funciona" className="section section-mist">
      <div className="shell">
        <Reveal>
          <p className="label label-sage">Como funciona</p>
          <h2 className="display section-title mt-4 max-w-2xl text-ink">
            Do primeiro clique à primeira sessão, em quatro passos
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal as="li" key={step.number} delay={index * 90} className="bg-paper">
              <div className="h-full p-7">
                <span className="font-serif text-[2.4rem] text-sage">{step.number}</span>
                <h3 className="mt-5 text-[16px] font-medium text-ink">{step.title}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-graphite">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
