import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/site/PublicShell";
import { ProfileForm } from "@/components/account/ProfileForm";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Configurações da conta",
  description: "Atualize seu e-mail e telefone de contato na ALENTO.",
};

export default async function ConfiguracoesPage() {
  const user = await currentUser();
  if (!user) redirect("/entrar?next=/minha-conta/configuracoes");

  return (
    <PublicShell>
      <section className="section section-mist pb-12">
        <div className="shell">
          <Link href="/minha-conta" className="link-sage text-[13px] text-graphite">
            ← Voltar para minha conta
          </Link>
          <p className="label label-sage mt-6">Minha conta</p>
          <h1 className="display mt-4 text-[clamp(2rem,4.4vw,3rem)] text-ink">Configurações</h1>
          <p className="lede mt-3">Mantenha seus dados de contato atualizados.</p>
        </div>
      </section>

      <section className="section pt-10">
        <div className="shell">
          <div className="max-w-2xl">
            <ProfileForm initial={{ name: user.name, email: user.email, phone: user.phone }} />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
