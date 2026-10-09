import { Reveal } from "@/components/ui/Reveal";
import { faqs } from "@/lib/site";

export function Faq() {
  return (
    <section id="duvidas" className="section section-mist">
      <div className="shell grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <p className="label label-sage">Dúvidas</p>
            <h2 className="display section-title mt-4 text-ink">
              Perguntas que aparecem antes da primeira sessão
            </h2>
            <p className="lede mt-5 max-w-sm">
              Não achou o que procurava? Fale com a gente pelo e-mail{" "}
              <span className="text-ink">contato@alento.com.br</span>.
            </p>
          </div>
        </Reveal>

        <div className="divide-y divide-line border-y border-line">
          {faqs.map((item, index) => (
            <Reveal key={item.question}>
              <details className="group py-5" open={index === 0}>
                <summary className="flex cursor-pointer items-center justify-between gap-6 text-[15px] text-ink [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-sage transition-transform group-open:rotate-45">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path
                        d="M6 1.5v9M1.5 6h9"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl pr-10 text-[13px] leading-relaxed text-graphite">
                  {item.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
