import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/site/PublicShell";
import { consumeVerificationToken } from "@/lib/db";

export const metadata: Metadata = {
  title: "Confirmar e-mail",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function VerificarEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const ok = token ? await consumeVerificationToken(token) : false;

  return (
    <PublicShell>
      <section className="section section-mist">
        <div className="shell max-w-xl">
          <div className="card p-8 text-center">
            {ok ? (
              <>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage-soft text-sage">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 12.5l4.2 4.2L19 7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h1 className="display mt-5 text-[1.7rem] text-ink">E-mail confirmado</h1>
                <p className="lede mx-auto mt-3 max-w-sm">
                  Tudo certo! Sua conta está ativa. Agora é só entrar e agendar sua sessão.
                </p>
                <div className="mt-7">
                  <Link href="/entrar" className="btn btn-primary">
                    Entrar na minha conta
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="display text-[1.7rem] text-ink">Link inválido ou expirado</h1>
                <p className="lede mx-auto mt-3 max-w-sm">
                  Não conseguimos confirmar este e-mail. O link pode ter expirado (validade de 24
                  horas) ou já ter sido usado.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link href="/entrar" className="btn btn-primary">
                    Entrar
                  </Link>
                  <Link href="/criar-conta" className="btn btn-outline">
                    Criar outra conta
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
