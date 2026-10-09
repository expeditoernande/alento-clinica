"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { approaches, psychologists } from "@/lib/site";
import type { StoredAppointment } from "@/lib/types";

function prettyDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

const statusLabel: Record<StoredAppointment["status"], string> = {
  agendada: "Agendada",
  cancelada: "Cancelada",
  realizada: "Realizada",
};

export function AppointmentList({ appointments }: { appointments: StoredAppointment[] }) {
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

  if (appointments.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[15px] text-ink">Você ainda não tem sessões agendadas.</p>
        <p className="lede mx-auto mt-2 max-w-sm">
          Quando estiver pronto, é só escolher um psicólogo e um horário.
        </p>
        <Link href="/agendar" className="btn btn-primary mt-6">
          Agendar primeira sessão
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <div className="notice notice-error">{error}</div>}

      {appointments.map((item) => {
        const person = psychologists.find((p) => p.slug === item.psychologistSlug);
        const approachName =
          approaches.find((a) => a.slug === person?.approach)?.short ?? "Psicologia";
        const cancelled = item.status === "cancelada";

        return (
          <article
            key={item.id}
            className={`card flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${
              cancelled ? "opacity-60" : ""
            }`}
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-sage-soft font-serif text-2xl text-sage">
              {person?.initial ?? "A"}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[15px] font-medium text-ink">
                  {person?.name ?? "Psicólogo"}
                </p>
                <span
                  className={`tag ${
                    cancelled ? "" : "border-sage bg-sage-soft text-sage"
                  }`}
                >
                  {statusLabel[item.status]}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-stone">
                {approachName} · {item.mode === "online" ? "Online" : "Presencial"}
              </p>
              <p className="mt-1 text-[13px] text-graphite">
                {prettyDate(item.date)} às {item.time} · código {item.code}
              </p>
            </div>

            {!cancelled && (
              <button
                type="button"
                className="btn btn-outline shrink-0 !px-5 !py-2.5 !text-[12px]"
                onClick={() => cancel(item.id)}
                disabled={pendingId === item.id}
              >
                {pendingId === item.id ? "Cancelando…" : "Cancelar"}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
