"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WEEKDAY_LABELS } from "@/lib/site";
import type { AvailabilityBlock, WeeklyWindow } from "@/lib/types";

const TIME_OPTIONS = Array.from(
  { length: 17 },
  (_, index) => `${String(6 + index).padStart(2, "0")}:00`,
);

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

type WindowDraft = { weekday: number; start: string; end: string };

export function AvailabilityEditor({
  initialWindows,
  initialBlocks,
}: {
  initialWindows: WeeklyWindow[];
  initialBlocks: AvailabilityBlock[];
}) {
  const router = useRouter();
  const [windows, setWindows] = useState<WindowDraft[]>(
    initialWindows.map((item) => ({ weekday: item.weekday, start: item.start, end: item.end })),
  );
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>(initialBlocks);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");

  const [blockDate, setBlockDate] = useState("");
  const [blockFullDay, setBlockFullDay] = useState(true);
  const [blockStart, setBlockStart] = useState("09:00");
  const [blockEnd, setBlockEnd] = useState("12:00");
  const [blockReason, setBlockReason] = useState("");
  const [blockError, setBlockError] = useState("");
  const [blockPending, setBlockPending] = useState(false);

  function addWindow(weekday: number) {
    setWindows((current) => [...current, { weekday, start: "09:00", end: "12:00" }]);
  }

  function updateWindow(index: number, patch: Partial<WindowDraft>) {
    setWindows((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  }

  function removeWindow(index: number) {
    setWindows((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function saveWindows() {
    setSaving(true);
    setSavedMsg("");
    setError("");
    try {
      const response = await fetch("/api/agenda", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ windows }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        windows?: WeeklyWindow[];
        message?: string;
        errors?: Record<string, string>;
      };
      if (!response.ok || !data.ok) {
        setError(data.message ?? data.errors?.windows ?? "Não foi possível salvar a grade.");
        return;
      }
      if (data.windows) {
        setWindows(
          data.windows.map((item) => ({ weekday: item.weekday, start: item.start, end: item.end })),
        );
      }
      setSavedMsg("Grade salva. Os pacientes já veem estes horários.");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function addBlock() {
    setBlockPending(true);
    setBlockError("");
    try {
      const response = await fetch("/api/agenda/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: blockDate,
          fullDay: blockFullDay,
          start: blockFullDay ? "" : blockStart,
          end: blockFullDay ? "" : blockEnd,
          reason: blockReason,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        blocks?: AvailabilityBlock[];
        message?: string;
        errors?: Record<string, string>;
      };
      if (!response.ok || !data.ok) {
        setBlockError(data.message ?? Object.values(data.errors ?? {})[0] ?? "Não foi possível bloquear.");
        return;
      }
      if (data.blocks) setBlocks(data.blocks);
      setBlockDate("");
      setBlockReason("");
      router.refresh();
    } catch {
      setBlockError("Falha de conexão. Tente novamente.");
    } finally {
      setBlockPending(false);
    }
  }

  async function removeBlock(id: string) {
    const data = await fetch(`/api/agenda/blocks?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((payload: { ok: boolean; blocks?: AvailabilityBlock[] }) => payload)
      .catch(() => null);
    if (data && data.ok && data.blocks) setBlocks(data.blocks);
  }

  return (
    <div className="space-y-10">
      <section className="card p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="display text-[1.5rem] text-ink">Grade semanal</h2>
            <p className="mt-1 text-[13px] text-stone">
              Defina os períodos em que você atende em cada dia. Deixe o dia vazio para não abrir.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary !px-5 !py-2.5 !text-[13px]"
            onClick={saveWindows}
            disabled={saving}
          >
            {saving ? "Salvando…" : "Salvar grade"}
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {WEEK_ORDER.map((weekday) => {
            const dayWindows = windows
              .map((item, index) => ({ ...item, index }))
              .filter((item) => item.weekday === weekday);
            return (
              <div key={weekday} className="rounded-2xl border border-line p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-ink">{WEEKDAY_LABELS[weekday]}</p>
                  <button
                    type="button"
                    className="text-[12px] text-sage hover:underline"
                    onClick={() => addWindow(weekday)}
                  >
                    + Adicionar período
                  </button>
                </div>

                {dayWindows.length === 0 ? (
                  <p className="mt-2 text-[12px] text-stone">Sem atendimento neste dia.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {dayWindows.map((item) => (
                      <div key={item.index} className="flex flex-wrap items-center gap-2">
                        <select
                          className="field !w-auto !py-2 !text-[13px]"
                          value={item.start}
                          onChange={(event) =>
                            updateWindow(item.index, { start: event.target.value })
                          }
                        >
                          {TIME_OPTIONS.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        <span className="text-stone">às</span>
                        <select
                          className="field !w-auto !py-2 !text-[13px]"
                          value={item.end}
                          onChange={(event) => updateWindow(item.index, { end: event.target.value })}
                        >
                          {TIME_OPTIONS.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="text-[12px] text-stone hover:text-ink"
                          onClick={() => removeWindow(item.index)}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {error && <div className="notice notice-error mt-5">{error}</div>}
        {savedMsg && <div className="notice mt-5 !text-sage">{savedMsg}</div>}
      </section>

      <section className="card p-6 md:p-8">
        <h2 className="display text-[1.5rem] text-ink">Bloqueios de data</h2>
        <p className="mt-1 text-[13px] text-stone">
          Marque férias, folgas ou indisponibilidades pontuais.
        </p>

        <div className="mt-6 grid gap-3 rounded-2xl border border-line p-4 md:grid-cols-[auto_1fr]">
          <input
            type="date"
            className="field"
            value={blockDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setBlockDate(event.target.value)}
          />
          <input
            className="field"
            placeholder="Motivo (opcional) — ex.: férias"
            value={blockReason}
            maxLength={120}
            onChange={(event) => setBlockReason(event.target.value)}
          />
          <label className="flex items-center gap-2 text-[13px] text-graphite">
            <input
              type="checkbox"
              checked={blockFullDay}
              onChange={(event) => setBlockFullDay(event.target.checked)}
            />
            Dia inteiro
          </label>
          {!blockFullDay && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="field !w-auto !py-2 !text-[13px]"
                value={blockStart}
                onChange={(event) => setBlockStart(event.target.value)}
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <span className="text-stone">às</span>
              <select
                className="field !w-auto !py-2 !text-[13px]"
                value={blockEnd}
                onChange={(event) => setBlockEnd(event.target.value)}
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="md:col-span-2">
            <button
              type="button"
              className="btn btn-soft !px-5 !py-2.5 !text-[13px]"
              onClick={addBlock}
              disabled={blockPending || !blockDate}
            >
              {blockPending ? "Bloqueando…" : "Adicionar bloqueio"}
            </button>
          </div>
        </div>
        {blockError && <div className="notice notice-error mt-4">{blockError}</div>}

        <div className="mt-6 space-y-2">
          {blocks.length === 0 ? (
            <p className="text-[13px] text-stone">Nenhum bloqueio futuro.</p>
          ) : (
            blocks.map((block) => (
              <div
                key={block.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-4 py-3"
              >
                <div>
                  <p className="text-[13px] text-ink">
                    {block.date.split("-").reverse().join("/")}
                    {block.start && block.end ? ` · ${block.start}–${block.end}` : " · dia inteiro"}
                  </p>
                  {block.reason && <p className="text-[12px] text-stone">{block.reason}</p>}
                </div>
                <button
                  type="button"
                  className="text-[12px] text-stone hover:text-ink"
                  onClick={() => removeBlock(block.id)}
                >
                  Remover
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
