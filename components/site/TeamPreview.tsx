import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { PsychologistCard } from "@/components/site/PsychologistCard";
import { psychologists } from "@/lib/site";

export function TeamPreview() {
  const featured = psychologists.slice(0, 3);

  return (
    <section className="section">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <div>
              <p className="label label-sage">Quem cuida</p>
              <h2 className="display section-title mt-4 max-w-xl text-ink">
                Psicólogos com registro ativo e supervisão
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <Link href="/psicologos" className="btn btn-outline shrink-0">
              Ver todos os {psychologists.length}
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((person, index) => (
            <Reveal key={person.slug} delay={index * 90}>
              <PsychologistCard person={person} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
