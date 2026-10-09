import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/site/PublicShell";
import { BookingForm } from "@/components/booking/BookingForm";
import { currentUser } from "@/lib/auth";
import { takenSlots } from "@/lib/db";
import { psychologists } from "@/lib/site";

export const metadata: Metadata = {
  title: "Agendar consulta",
  description:
    "Escolha o psicólogo, a data e o horário e confirme sua sessão em poucos cliques.",
};

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: Promise<{ psi?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/entrar?next=/agendar");

  const { psi } = await searchParams;

  const entries = await Promise.all(
    psychologists.map(async (person) => [person.slug, await takenSlots(person.slug)] as const),
  );
  const taken: Record<string, string[]> = Object.fromEntries(entries);

  return (
    <PublicShell>
      <section className="border-b border-line">
        <div className="shell py-14 md:py-16">
          <p className="label label-sage">Agendamento</p>
          <h1 className="display mt-4 text-[clamp(2rem,4.4vw,3.2rem)] text-ink">
            Marque sua sessão
          </h1>
          <p className="lede mt-4 max-w-xl">
            Olá, {user.name.split(" ")[0]}. Escolha o profissional, a data e o horário. A
            confirmação aparece na hora e também na sua conta.
          </p>
        </div>
      </section>

      <section className="section pt-12 md:pt-14">
        <div className="shell">
          <BookingForm initialSlug={psi} taken={taken} />
        </div>
      </section>
    </PublicShell>
  );
}
