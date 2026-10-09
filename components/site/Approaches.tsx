import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { approaches } from "@/lib/site";

export function Approaches() {
  return (
    <section className="section">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <div>
              <p className="label label-sage">Abordagens</p>
              <h2 className="display section-title mt-4 max-w-xl text-ink">
                Cada pessoa combina com um jeito de trabalhar
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <Link href="/psicologos" className="btn btn-outline shrink-0">
              Ver quem atende
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {approaches.map((approach, index) => (
            <Reveal key={approach.slug} delay={index * 80}>
              <article className="card card-hover h-full p-7">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[17px] font-medium text-ink">{approach.name}</h3>
                  <span className="tag shrink-0">{approach.short}</span>
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-graphite">
                  {approach.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
