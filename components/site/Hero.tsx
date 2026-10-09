import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { takenSlots } from "@/lib/db";
import { heroSlide, psychologists, SESSION_SLOTS } from "@/lib/site";

function isoDay(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function formatDay(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export async function Hero() {
  const featured = psychologists[0];
  const taken = new Set(await takenSlots(featured.slug).catch(() => []));

  let bestDay = isoDay(1);
  let free: string[] = [];
  for (let offset = 0; offset < 14; offset++) {
    const day = isoDay(offset);
    const slots = SESSION_SLOTS.filter((time) => !taken.has(`${day} ${time}`));
    if (slots.length >= 4) {
      bestDay = day;
      free = slots;
      break;
    }
    if (slots.length > free.length) {
      bestDay = day;
      free = slots;
    }
  }

  const shown = free.slice(0, 6);
  const dayLabel = formatDay(bestDay);
  const bookHref = `/agendar?psi=${featured.slug}&date=${bestDay}${
    shown[0] ? `&time=${encodeURIComponent(shown[0])}` : ""
  }`;

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-sage-soft to-paper"
        aria-hidden="true"
      />
      <div className="shell relative grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="label label-sage">{heroSlide.eyebrow}</p>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="display mt-5 text-[clamp(2.5rem,6.4vw,4.6rem)] text-ink">
              Um lugar tranquilo para <em className="text-sage not-italic">olhar para si</em>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="lede mt-6 max-w-xl text-[15px]">{heroSlide.lede}</p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/criar-conta" className="btn btn-primary">
                Começar agora
              </Link>
              <Link href="/psicologos" className="btn btn-outline">
                Ver psicólogos
              </Link>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-6 text-[12px] text-stone">
              Leva um minuto. Você só paga pela sessão, sem mensalidade.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8">
              {heroSlide.highlights.map((item) => (
                <div key={item.label}>
                  <dt className="display text-[2rem] text-ink">
                    {item.value}
                    <span className="ml-0.5 text-[0.9rem] text-sage">{item.suffix}</span>
                  </dt>
                  <dd className="mt-1 text-[11px] leading-snug text-stone">{item.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={160}>
          <div className="relative mx-auto w-full max-w-md">
            <div className="card card-hover overflow-hidden">
              <div className="flex items-center gap-3 border-b border-line p-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-soft font-serif text-lg text-sage">
                  {featured.initial}
                </span>
                <div>
                  <p className="text-[14px] font-medium text-ink">{featured.name}</p>
                  <p className="text-[11px] text-stone">
                    {featured.role} — {featured.crp}
                  </p>
                </div>
                <span className="ml-auto h-2 w-2 rounded-full bg-sage" aria-hidden="true" />
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="label">Próximos horários</p>
                  <p className="text-[11px] text-sage">{dayLabel}</p>
                </div>

                {shown.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {shown.map((time, index) => (
                      <Link
                        key={time}
                        href={`/agendar?psi=${featured.slug}&date=${bestDay}&time=${encodeURIComponent(time)}`}
                        className={`rounded-xl border px-2 py-2.5 text-center text-[12px] transition-colors ${
                          index === 0
                            ? "border-sage bg-sage text-paper"
                            : "border-line text-graphite hover:border-sage hover:text-sage"
                        }`}
                      >
                        {time}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="notice !py-3 !text-[12px]">
                    Sem horários livres nos próximos dias. Veja a agenda completa.
                  </p>
                )}

                <div className="flex items-center justify-between rounded-xl bg-mist px-4 py-3">
                  <div>
                    <p className="text-[12px] text-stone">Sessão de 50 minutos</p>
                    <p className="text-[14px] text-ink">
                      R$ {featured.price} <span className="text-[11px] text-stone">/ sessão</span>
                    </p>
                  </div>
                  <Link href={bookHref} className="btn btn-soft !px-4 !py-2 !text-[11px]">
                    Agendar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
