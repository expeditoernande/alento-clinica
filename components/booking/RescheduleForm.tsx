"use client";

import { useEffect, useState } from "react";
import { SESSION_SLOTS } from "@/lib/site";
import type { FieldErrors } from "@/lib/validation";

function today() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function RescheduleForm({
  id,
  slug,
  initialDate,
  onDone,
  onClose,
}: {
  id: string;
  slug: string;
  initialDate: string;
  onDone: () => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(initialDate >= today() ? initialDate : today());
  const [time, setTime] = useState("");
  const [slotData, setSlotData] = useState<{ key: string; slots: Set<string> } | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    const key = `${slug}:${date}`;
    const params = new URLSearchParams({ slug, date, exclude: id });
    fetch(`/api/availability?${params.toString()}`)
      .then((response) => response.json())
      .then((data: { ok?: boolean; available?: string[] }) => {
        if (active && data.ok) setSlotData({ key, slots: new Set(data.available ?? []) });
      })
      .catch(() => {
        if (active) setSlotData({ key, slots: new Set() });
      });
    return () => {
      active = false;
    };
  }, [slug, id, date]);

  const available = slotData && slotData.key === `${slug}:${date}` ? slotData.slots : null;

  async function submit() {
    setPending(true);
    setErrors({});
    setMessage("");
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        errors?: FieldErrors;
        message?: string;
      };
      if (!response.ok || !data.ok) {
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "Confira os campos destacados.");
        return;
      }
      onDone();
    } catch {
      setMessage("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-line bg-mist p-4">
      <p className="text-[13px] font-medium text-ink">Escolha a nova data e horário</p>

      <div className="mt-3 max-w-xs">
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

      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {SESSION_SLOTS.map((slot) => {
          const loading = available === null;
          const busy = available !== null && !available.has(slot);
          const active = time === slot;
          return (
            <button
              type="button"
              key={slot}
              disabled={busy || loading}
              onClick={() => setTime(slot)}
              className={`rounded-xl border bg-paper px-2 py-2.5 text-center text-[12px] transition-colors ${
                busy
                  ? "cursor-not-allowed border-line text-stone line-through"
                  : loading
                    ? "cursor-wait border-line text-stone opacity-50"
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

      {message && <div className="notice notice-error mt-4">{message}</div>}

      <div className="mt-4 flex flex-wrap gap-2.5">
        <button
          type="button"
          className="btn btn-primary !px-5 !py-2.5 !text-[12px]"
          onClick={submit}
          disabled={pending || available === null || !time}
        >
          {pending ? "Salvando…" : "Confirmar novo horário"}
        </button>
        <button
          type="button"
          className="btn btn-outline !px-5 !py-2.5 !text-[12px]"
          onClick={onClose}
          disabled={pending}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
