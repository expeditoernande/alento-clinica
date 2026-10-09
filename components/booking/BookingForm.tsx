"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { approaches, psychologists, SESSION_SLOTS } from "@/lib/site";
import type { FieldErrors } from "@/lib/validation";

function today() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function validDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value >= today() ? value : null;
}

function approachName(slug: string) {
  return approaches.find((item) => item.slug === slug)?.short ?? slug;
}

export function BookingForm({
  initialSlug,
  initialDate,
  initialTime,
  taken,
}: {
  initialSlug?: string;
  initialDate?: string;
  initialTime?: string;
  taken: Record<string, string[]>;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState<string>(
    initialSlug && psychologists.some((p) => p.slug === initialSlug)
      ? initialSlug
      : psychologists[0].slug,
  );
  const person = psychologists.find((item) => item.slug === slug)!;

  const [date, setDate] = useState(validDate(initialDate) ?? today());
  const [time, setTime] = useState(
    initialTime && SESSION_SLOTS.includes(initialTime) ? initialTime : "",
  );
  const [mode, setMode] = useState<"online" | "presencial">(
    person.online ? "online" : "presencial",
  );
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ code: string } | null>(null);

  const takenSet = useMemo(() => new Set(taken[slug] ?? []), [taken, slug]);

  function pickPerson(nextSlug: string) {
    const next = psychologists.find((item) => item.slug === nextSlug)!;
    setSlug(nextSlug);
    setTime("");
    if (mode === "presencial" && !next.inPerson) setMode("online");
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ psychologistSlug: slug, date, time, mode, notes }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        appointment?: { code: string };
        errors?: FieldErrors;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "Confira os campos destacados.");
        return;
      }

      setDone({ code: data.appointment!.code });
      router.refresh();
    } catch {
      setMessage("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="card p-8 text-center">
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
        <h2 className="display mt-5 text-[1.7rem] text-ink">Sessão agendada</h2>
        <p className="lede mx-auto mt-3 max-w-sm">
          Seu horário com <strong className="text-ink">{person.name}</strong> foi reservado. O
          código <strong className="text-ink">{done.code}</strong> identifica esta consulta.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/minha-conta" className="btn btn-primary">
            Ver minha conta
          </Link>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setDone(null);
              setTime("");
              setNotes("");
            }}
          >
            Agendar outra
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]" noValidate>
      <div className="space-y-8">
        <fieldset>
          <legend className="label">1 — Escolha o psicólogo</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {psychologists.map((item) => (
              <button
                type="button"
                key={item.slug}
                onClick={() => pickPerson(item.slug)}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                  slug === item.slug
                    ? "border-sage bg-sage-soft"
                    : "border-line bg-paper hover:border-sage"
                }`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper font-serif text-lg text-sage">
                  {item.initial}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium text-ink">
                    {item.name}
                  </span>
                  <span className="block text-[11px] text-stone">
                    {approachName(item.approach)} · R$ {item.price}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">2 — Modalidade</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["online", "presencial"] as const).map((option) => {
              const disabled = option === "presencial" && !person.inPerson;
              return (
                <button
                  type="button"
                  key={option}
                  disabled={disabled}
                  onClick={() => setMode(option)}
                  className={`tag cursor-pointer capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    mode === option ? "border-sage bg-sage-soft text-sage" : ""
                  }`}
                >
                  {option}
                </button>
              );
            })}
            {!person.inPerson && (
              <span className="self-center text-[11px] text-stone">
                Este profissional atende apenas online.
              </span>
            )}
          </div>
          {errors.mode && <p className="field-error">{errors.mode}</p>}
        </fieldset>

        <fieldset>
          <legend className="label">3 — Data e horário</legend>
          <div className="mt-4 max-w-xs">
            <input
              type="date"
              className="field"
              min={today()}
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setTime("");
              }}
              aria-invalid={Boolean(errors.date)}
            />
            {errors.date && <p className="field-error">{errors.date}</p>}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {SESSION_SLOTS.map((slot) => {
              const busy = takenSet.has(`${date} ${slot}`);
              const active = time === slot;
              return (
                <button
                  type="button"
                  key={slot}
                  disabled={busy}
                  onClick={() => setTime(slot)}
                  className={`rounded-xl border px-2 py-2.5 text-center text-[12px] transition-colors ${
                    busy
                      ? "cursor-not-allowed border-line bg-mist text-stone line-through"
                      : active
                        ? "border-sage bg-sage text-paper"
                        : "border-line text-graphite hover:border-sage"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
          {errors.time && <p className="field-error">{errors.time}</p>}
        </fieldset>

        <div>
          <label className="label" htmlFor="notes">
            4 — Algo que queira adiantar? (opcional)
          </label>
          <textarea
            id="notes"
            className="field mt-3"
            placeholder="Pode ser o que te trouxe até aqui, no seu ritmo."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={600}
          />
        </div>
      </div>

      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <div className="card p-6">
          <p className="label">Resumo</p>
          <div className="mt-4 flex items-center gap-3 border-b border-line pb-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-sage-soft font-serif text-xl text-sage">
              {person.initial}
            </span>
            <div>
              <p className="text-[14px] font-medium text-ink">{person.name}</p>
              <p className="text-[11px] text-stone">{person.crp}</p>
            </div>
          </div>

          <dl className="mt-4 space-y-3 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-stone">Data</dt>
              <dd className="text-ink">{date.split("-").reverse().join("/")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone">Horário</dt>
              <dd className="text-ink">{time || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone">Modalidade</dt>
              <dd className="capitalize text-ink">{mode}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3">
              <dt className="text-stone">Valor da sessão</dt>
              <dd className="text-ink">R$ {person.price}</dd>
            </div>
          </dl>

          {message && <div className="notice notice-error mt-5">{message}</div>}

          <button
            type="submit"
            className="btn btn-primary mt-6 w-full"
            disabled={pending || !time}
          >
            {pending ? "Agendando…" : time ? "Confirmar agendamento" : "Escolha um horário"}
          </button>
          <p className="mt-4 text-[11px] leading-relaxed text-stone">
            O pagamento é combinado direto com o profissional. Você pode cancelar pela sua
            conta a qualquer momento.
          </p>
        </div>
      </aside>
    </form>
  );
}
