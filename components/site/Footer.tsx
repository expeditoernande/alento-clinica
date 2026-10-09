import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { clinic, nav } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-mist">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div>
          <Logo />
          <p className="lede mt-5 max-w-xs">
            {clinic.positioning.charAt(0).toUpperCase() + clinic.positioning.slice(1)}. {" "}
            Atendimento psicológico online e presencial, com sigilo e ética.
          </p>
          <p className="label mt-6">Desde {clinic.founded} — {clinic.city}</p>
        </div>

        <div>
          <p className="label">Navegar</p>
          <ul className="mt-5 space-y-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-sage text-[14px] text-graphite">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/quero-atender" className="link-sage text-[14px] text-graphite">
                Quero atender
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label">Contato</p>
          <ul className="mt-5 space-y-3 text-[14px] text-graphite">
            <li>
              <a href={`mailto:${clinic.email}`} className="link-sage">
                {clinic.email}
              </a>
            </li>
            <li>
              <a href={`tel:+${clinic.whatsapp}`} className="link-sage">
                {clinic.phone}
              </a>
            </li>
            <li className="text-stone">{clinic.address}</li>
            <li className="text-stone">{clinic.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-3 py-6 text-[12px] text-stone md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {clinic.legal}</p>
          <p>
            Este site não substitui atendimento de emergência. Em crise, ligue 188 (CVV) ou 192.
          </p>
        </div>
      </div>
    </footer>
  );
}
