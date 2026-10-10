"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { approaches, psychologists } from "@/lib/site";
import type { AppointmentStatus, StoredAppointment } from "@/lib/types";

function prettyDate(value: string) {
  const [year, month, day] = value.split("-");
  const date = new Date(`${value}T12:00:00Z`);
  const weekday = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    timeZone: "America/Sao_Paulo",
  });
  return {
    date: `${day}/${month}/${year}`,
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
  };
}

const statusLabel: Record<AppointmentStatus, string> = {
  agendada: "Agendada",
  cancelada: "Cancelada",
  realizada: "Realizada",
};

const statusStyle: Record<AppointmentStatus, string> = {
  agendada: "border-sage bg-sage-soft text-sage",
  realizada: "border-line bg-mist text-graphite",
  cancelada: "border-line text-stone",
};

export function AppointmentList({
  upcoming,
  previous,
}: {
  upcoming: StoredAppointment[];
  previous: StoredAppointment[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function cancel(id: string) {
    setPendingId(id);
    setError("");
    try {
      const response = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (!response.ok) {
        setError("Não foi possível cancelar agora. Tente novamente.");
        return;
      }
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setPendingId(null);
    }
  }

  if (upcoming.length === 0 && previous.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[15px] text-ink">Você ainda não tem sessões.</p>
        <p className="lede mx-auto mt-2 max-w-sm">
          Quando estiver pronto, é só escolher um psicólogo e um horário.
        </p>
        <Link href="/agendar" className="btn btn-primary mt-6">
          Agendar primeira sessão
        </Link>
      </div>
    );
  }

  const nextId = upcoming[0]?.id;

  return (
    <div className="space-y-10">
      {error && <div className="notice notice-error">{error}</div>}

      <section>
        <h3 className="label">Próximas</h3>
        {upcoming.length === 0 ? (
          <div className="notice mt-4">
            Nenhuma sessão agendada no momento.{" "}
            <Link href="/agendar" className="link-sage text-ink">
              Agendar agora
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {upcoming.map((item) => (
              <Row
                key={item.id}
                item={item}
                highlight={item.id === nextId}
                pending={pendingId === item.id}
                cancellable
                onCancel={cancel}
              />
            ))}
          </div>
        )}
      </section>

      {previous.length > 0 && (
        <section>
          <h3 className="label">Histórico</h3>
          <div className="mt-4 space-y-4">
            {previous.map((item) => (
              <Row key={item.id} item={item} onCancel={cancel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Row({
  item,
  highlight = false,
  pending = false,
  cancellable = false,
  onCancel,
}: {
  item: StoredAppointment;
  highlight?: boolean;
  pending?: boolean;
  cancellable?: boolean;
  onCancel: (id: string) => void;
}) {
  const person = psychologists.find((p) => p.slug === item.psychologistSlug);
  const approachName =
    approaches.find((a) => a.slug === person?.approach)?.short ?? "Psicologia";
  const { date, weekday } = prettyDate(item.date);
  const cancelled = item.status === "cancelada";

  return (
    <article
      className={`card flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${
        cancelled ? "opacity-60" : ""
      } ${highlight ? "border-sage ring-1 ring-sage/30" : ""}`}
    >
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-sage-soft font-serif text-2xl text-sage">
        {person?.initial ?? "A"}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[15px] font-medium text-ink">{person?.name ?? "Psicólogo"}</p>
          {highlight && <span className="tag border-sage bg-sage text-paper">Próxima</span>}
          <span className={`tag ${statusStyle[item.status]}`}>{statusLabel[item.status]}</span>
          <span
            className={`tag ${
              item.mode === "online" ? "border-sage/40 text-sage" : "border-clay/50 text-clay"
            }`}
          >
            {item.mode === "online" ? "Online" : "Presencial"}
          </span>
        </div>
        <p className="mt-1.5 text-[13px] text-graphite">
          {weekday}, {date} às {item.time}
        </p>
        <p className="mt-1 text-[12px] text-stone">
          {approachName} · código {item.code}
        </p>
      </div>

      {cancellable && (
        <button
          type="button"
          className="btn btn-outline shrink-0 !px-5 !py-2.5 !text-[12px]"
          onClick={() => onCancel(item.id)}
          disabled={pending}
        >
          {pending ? "Cancelando…" : "Cancelar"}
        </button>
      )}
    </article>
  );
}
