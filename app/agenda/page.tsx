import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/site/PublicShell";
import { AvailabilityEditor } from "@/components/agenda/AvailabilityEditor";
import { GoogleCalendarCard } from "@/components/agenda/GoogleCalendarCard";
import { currentPsychologistSlug } from "@/lib/auth";
import { getGoogleAccount, listBlocks, listWeeklyWindows } from "@/lib/db";
import { googleConfigured } from "@/lib/google";
import { psychologists } from "@/lib/site";

export const metadata: Metadata = {
  title: "Minha agenda",
  description: "Gerencie sua grade de atendimento e bloqueios de data.",
  robots: { index: false, follow: false },
};

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const slug = await currentPsychologistSlug();
  if (!slug) notFound();

  const params = await searchParams;
  const googleNotice = typeof params.google === "string" ? params.google : "";

  const person = psychologists.find((item) => item.slug === slug);
  const [windows, blocks, account] = await Promise.all([
    listWeeklyWindows(slug),
    listBlocks(slug),
    getGoogleAccount(slug),
  ]);

  return (
    <PublicShell>
      <section className="border-b border-line">
        <div className="shell py-14 md:py-16">
          <p className="label label-sage">Área do psicólogo</p>
          <h1 className="display mt-4 text-[clamp(2rem,4.4vw,3.2rem)] text-ink">
            {person ? `Agenda de ${person.name}` : "Minha agenda"}
          </h1>
          <p className="lede mt-4 max-w-xl">
            Estes horários aparecem automaticamente para os pacientes ao agendar com você.
          </p>
        </div>
      </section>

      <section className="section pt-12 md:pt-14">
        <div className="shell space-y-10">
          <GoogleCalendarCard
            configured={googleConfigured()}
            connected={Boolean(account)}
            email={account?.email ?? ""}
            notice={googleNotice}
          />
          <AvailabilityEditor initialWindows={windows} initialBlocks={blocks} />
        </div>
      </section>
    </PublicShell>
  );
}
