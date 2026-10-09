import Link from "next/link";
import type { Psychologist } from "@/lib/site";

export function PsychologistCard({ person }: { person: Psychologist }) {
  return (
    <article className="card card-hover flex h-full flex-col p-6">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-sage-soft font-serif text-2xl text-sage">
          {person.initial}
        </span>
        <div>
          <h3 className="text-[16px] font-medium text-ink">{person.name}</h3>
          <p className="text-[11px] text-stone">
            {person.role} · {person.crp}
          </p>
        </div>
      </div>

      <p className="mt-5 flex-1 text-[13px] leading-relaxed text-graphite">{person.bio}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {person.specialties.slice(0, 3).map((item) => (
          <span key={item} className="tag">
            {item}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
        <div className="text-[12px] text-stone">
          <p className="text-ink">
            R$ {person.price} <span className="text-stone">/ sessão</span>
          </p>
          <p className="mt-0.5">
            {[person.online && "Online", person.inPerson && "Presencial"]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <Link
          href={`/agendar?psi=${person.slug}`}
          className="btn btn-soft !px-5 !py-2.5 !text-[11px]"
        >
          Agendar
        </Link>
      </div>
    </article>
  );
}
