"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NOTICES: Record<string, { tone: "ok" | "error"; text: string }> = {
  conectado: { tone: "ok", text: "Google Agenda conectado. Os horários ocupados já podem ser lidos." },
  negado: { tone: "error", text: "Você cancelou a autorização do Google." },
  erro: { tone: "error", text: "Não foi possível conectar ao Google. Tente novamente." },
  naoconfigurado: {
    tone: "error",
    text: "A integração com o Google ainda não foi configurada no servidor.",
  },
  restrito: { tone: "error", text: "Apenas psicólogos podem conectar a agenda." },
};

export function GoogleCalendarCard({
  configured,
  connected,
  email,
  notice,
}: {
  configured: boolean;
  connected: boolean;
  email: string;
  notice: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const banner = NOTICES[notice];

  async function disconnect() {
    setPending(true);
    try {
      await fetch("/api/integrations/google/disconnect", { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="display text-[1.5rem] text-ink">Google Agenda</h2>
          <p className="mt-1 max-w-lg text-[13px] text-stone">
            Conecte sua conta Google para ler os horários ocupados e criar os eventos das sessões
            automaticamente. A sincronização é feita entre o seu calendário e esta agenda.
          </p>
        </div>

        {configured && !connected && (
          <a href="/api/integrations/google/connect" className="btn btn-soft !px-5 !py-2.5 !text-[13px]">
            Conectar Google Agenda
          </a>
        )}

        {configured && connected && (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-[13px] text-ink">
              <span className="h-2 w-2 rounded-full bg-sage" aria-hidden="true" />
              Conectado
            </span>
            <button
              type="button"
              className="btn btn-outline !px-5 !py-2.5 !text-[13px]"
              onClick={disconnect}
              disabled={pending}
            >
              {pending ? "Desconectando…" : "Desconectar"}
            </button>
          </div>
        )}
      </div>

      {configured && connected && email && (
        <p className="mt-4 text-[13px] text-graphite">
          Conta conectada: <strong className="text-ink">{email}</strong>
        </p>
      )}

      {!configured && (
        <p className="mt-4 text-[13px] text-stone">
          Integração indisponível no momento. Configure <code>GOOGLE_CLIENT_ID</code> e{" "}
          <code>GOOGLE_CLIENT_SECRET</code> para habilitá-la.
        </p>
      )}

      {banner && (
        <div className={`notice mt-4 ${banner.tone === "error" ? "notice-error" : ""}`}>
          {banner.text}
        </div>
      )}
    </section>
  );
}
