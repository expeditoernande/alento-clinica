import Link from "next/link";
import { PublicShell } from "@/components/site/PublicShell";

export default function NotFound() {
  return (
    <PublicShell>
      <section className="section">
        <div className="shell flex flex-col items-center py-16 text-center">
          <p className="label label-sage">Erro 404</p>
          <h1 className="display mt-4 text-[clamp(2rem,5vw,3.4rem)] text-ink">
            Essa página não existe
          </h1>
          <p className="lede mx-auto mt-4 max-w-md">
            Talvez o endereço tenha mudado ou o link esteja errado. Você pode voltar ao
            início ou ver nossos psicólogos.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn btn-primary">
              Voltar ao início
            </Link>
            <Link href="/psicologos" className="btn btn-outline">
              Ver psicólogos
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
