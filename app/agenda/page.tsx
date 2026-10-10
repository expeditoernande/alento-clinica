import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/site/PublicShell";
import { AvailabilityEditor } from "@/components/agenda/AvailabilityEditor";
import { currentPsychologistSlug } from "@/lib/auth";
import { listBlocks, listWeeklyWindows } from "@/lib/db";
import { psychologists } from "@/lib/site";

export const metadata: Metadata = {
  title: "Minha agenda",
  description: "Gerencie sua grade de atendimento e bloqueios de data.",
  robots: { index: false, follow: false },
};

export default async function AgendaPage() {
  const slug = await currentPsychologistSlug();
  if (!slug) notFound();

  const person = psychologists.find((item) => item.slug === slug);
  const [windows, blocks] = await Promise.all([listWeeklyWindows(slug), listBlocks(slug)]);

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
        <div className="shell">
          <AvailabilityEditor initialWindows={windows} initialBlocks={blocks} />
        </div>
      </section>
    </PublicShell>
  );
}
