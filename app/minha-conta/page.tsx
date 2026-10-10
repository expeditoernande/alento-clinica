import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/site/PublicShell";
import { AppointmentList } from "@/components/booking/AppointmentList";
import { LogoutButton } from "@/components/site/LogoutButton";
import { currentUser } from "@/lib/auth";
import { listAppointments } from "@/lib/db";
import { psychologists } from "@/lib/site";
import type { StoredAppointment } from "@/lib/types";

export const metadata: Metadata = {
  title: "Minha conta",
  description: "Acompanhe e gerencie suas sessões na ALENTO.",
};

/** Agora em São Paulo, no formato "YYYY-MM-DDTHH:MM" para comparar com as sessões. */
function nowInSaoPaulo(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function isUpcoming(item: StoredAppointment, now: string) {
  return item.status === "agendada" && `${item.date}T${item.time}` >= now;
}

export default async function MinhaContaPage() {
  const user = await currentUser();
  if (!user) redirect("/entrar?next=/minha-conta");

  const appointments = await listAppointments(user.id);
  const now = nowInSaoPaulo();

  const upcoming = appointments
    .filter((item) => isUpcoming(item, now))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const previous = appointments
    .filter((item) => !isUpcoming(item, now))
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  const next = upcoming[0];
  const nextPsychologist = next
    ? psychologists.find((p) => p.slug === next.psychologistSlug)
    : undefined;

  return (
    <PublicShell>
      <section className="section section-mist pb-12">
        <div className="shell flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label label-sage">Minha conta</p>
            <h1 className="display mt-4 text-[clamp(2rem,4.4vw,3rem)] text-ink">
              Olá, {user.name.split(" ")[0]}
            </h1>
            <p className="lede mt-3">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/agendar" className="btn btn-primary">
              Agendar sessão
            </Link>
            <LogoutButton />
          </div>
        </div>
      </section>

      <section className="section pt-10">
        <div className="shell">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="card p-5">
              <p className="label">Próximas sessões</p>
              <p className="display mt-2 text-[2rem] text-ink">{upcoming.length}</p>
            </div>
            <div className="card p-5">
              <p className="label">Próxima sessão</p>
              <p className="mt-2 text-[15px] text-ink">
                {next ? `${next.date.split("-").reverse().join("/")} às ${next.time}` : "—"}
              </p>
              <p className="mt-1 text-[12px] text-stone">
                {nextPsychologist ? nextPsychologist.name : "Nenhuma agendada"}
              </p>
            </div>
            <div className="card p-5">
              <p className="label">Histórico</p>
              <p className="display mt-2 text-[2rem] text-ink">{previous.length}</p>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <h2 className="text-[17px] font-medium text-ink">Suas sessões</h2>
            <Link href="/psicologos" className="link-sage text-[13px] text-graphite">
              Ver psicólogos
            </Link>
          </div>

          <div className="mt-6">
            <AppointmentList upcoming={upcoming} previous={previous} />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
