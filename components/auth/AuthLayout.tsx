import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="section">
      <div className="shell grid items-center gap-16 py-8 lg:grid-cols-2 lg:gap-24">
        <div className="mx-auto w-full max-w-md">{children}</div>

        <div className="hidden lg:block">
          <div className="rounded-[28px] bg-sage-soft p-10">
            <p className="label label-sage">Por que ter uma conta</p>
            <ul className="mt-6 space-y-6">
              {[
                {
                  title: "Agende no seu tempo",
                  body: "Escolha o psicólogo, o dia e o horário que caibam na sua rotina, a qualquer hora.",
                },
                {
                  title: "Acompanhe suas sessões",
                  body: "Veja os próximos atendimentos, o histórico e cancele ou remarque quando precisar.",
                },
                {
                  title: "Sigilo garantido",
                  body: "Seus dados e o conteúdo das sessões ficam protegidos pelo sigilo profissional.",
                },
              ].map((item, index) => (
                <li key={item.title} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper font-serif text-sm text-sage">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[15px] font-medium text-ink">{item.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-graphite">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
