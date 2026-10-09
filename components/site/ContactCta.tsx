import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { clinic } from "@/lib/site";

export function ContactCta() {
  return (
    <section id="contato" className="section">
      <div className="shell">
        <Reveal>
          <div className="overflow-hidden rounded-[28px] border border-line bg-ink px-7 py-12 text-paper md:px-14 md:py-16">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
              <div>
                <p className="label text-sage">Contato</p>
                <h2 className="display mt-4 text-[clamp(2rem,4.4vw,3.2rem)] text-paper">
                  Dê o primeiro passo. A gente cuida do resto.
                </h2>
                <p className="mt-5 max-w-md text-[14px] leading-relaxed text-paper/70">
                  Crie sua conta, veja a agenda dos psicólogos e marque a sessão que cabe
                  na sua semana. Se preferir, fale com a gente antes.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    href="/criar-conta"
                    className="btn bg-paper text-ink hover:bg-sage hover:text-paper"
                  >
                    Criar minha conta
                  </Link>
                  <a
                    href={`https://wa.me/${clinic.whatsapp}`}
                    className="btn border border-paper/25 text-paper hover:border-paper"
                  >
                    Falar no WhatsApp
                  </a>
                </div>
              </div>

              <div className="grid content-start gap-6 border-t border-paper/15 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-20">
                <div>
                  <p className="label text-paper/50">E-mail</p>
                  <a href={`mailto:${clinic.email}`} className="mt-2 block text-[15px] text-paper">
                    {clinic.email}
                  </a>
                </div>
                <div>
                  <p className="label text-paper/50">Telefone</p>
                  <a href={`tel:+${clinic.whatsapp}`} className="mt-2 block text-[15px] text-paper">
                    {clinic.phone}
                  </a>
                </div>
                <div>
                  <p className="label text-paper/50">Endereço</p>
                  <p className="mt-2 text-[15px] text-paper">{clinic.address}</p>
                  <p className="mt-1 text-[13px] text-paper/60">{clinic.hours}</p>
                </div>

                <div className="mt-2 rounded-2xl border border-paper/15 p-5">
                  <p className="text-[14px] text-paper">É psicólogo e quer atender aqui?</p>
                  <Link
                    href="/quero-atender"
                    className="link-sage mt-3 inline-block text-[13px] text-sage"
                  >
                    Envie seu currículo →
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
