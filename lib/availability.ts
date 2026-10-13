import { calendarBusy } from "@/lib/calendar";
import { CLINIC_UTC_OFFSET, type BusyInterval } from "@/lib/calendar/types";
import { listBlocks, listWeeklyWindows, takenSlots } from "@/lib/db";
import { SESSION_SLOTS } from "@/lib/site";

const SLOT_MINUTES = 60;

export function weekdayOf(date: string): number {
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? -1 : parsed.getUTCDay();
}

function isWithin(slot: string, start: string, end: string): boolean {
  return slot >= start && slot < end;
}

export function baseSlotsFor(
  windows: Array<{ weekday: number; start: string; end: string }>,
  date: string,
): string[] {
  if (windows.length === 0) return [...SESSION_SLOTS];
  const weekday = weekdayOf(date);
  return SESSION_SLOTS.filter((slot) =>
    windows.some((window) => window.weekday === weekday && isWithin(slot, window.start, window.end)),
  );
}

export function blockedSlotsFor(
  blocks: Array<{ date: string; start: string | null; end: string | null }>,
  date: string,
): string[] {
  const forDate = blocks.filter((block) => block.date === date);
  if (forDate.some((block) => block.start === null || block.end === null)) return [...SESSION_SLOTS];
  return SESSION_SLOTS.filter((slot) =>
    forDate.some((block) => isWithin(slot, block.start as string, block.end as string)),
  );
}

/** Marca como ocupado todo slot que colida com algum intervalo vindo da agenda externa. */
export function busySlotsForDate(intervals: BusyInterval[], date: string): string[] {
  const slotMs = SLOT_MINUTES * 60 * 1000;
  return SESSION_SLOTS.filter((slot) => {
    const start = new Date(`${date}T${slot}:00${CLINIC_UTC_OFFSET}`).getTime();
    const end = start + slotMs;
    return intervals.some((busy) => {
      const busyStart = new Date(busy.start).getTime();
      const busyEnd = new Date(busy.end).getTime();
      if (Number.isNaN(busyStart) || Number.isNaN(busyEnd)) return false;
      return busyStart < end && busyEnd > start;
    });
  });
}

export async function availableSlots(
  slug: string,
  date: string,
  excludeId?: string,
): Promise<string[]> {
  const dayStart = new Date(`${date}T00:00:00${CLINIC_UTC_OFFSET}`).toISOString();
  const dayEnd = new Date(`${date}T23:59:59${CLINIC_UTC_OFFSET}`).toISOString();
  const [windows, blocks, taken, busy] = await Promise.all([
    listWeeklyWindows(slug),
    listBlocks(slug),
    takenSlots(slug, excludeId),
    calendarBusy(slug, dayStart, dayEnd).catch(() => null),
  ]);
  const takenSet = new Set(taken.filter((entry) => entry.startsWith(`${date} `)));
  const blocked = new Set(blockedSlotsFor(blocks, date));
  const externalBusy = new Set(busy ? busySlotsForDate(busy, date) : []);
  return baseSlotsFor(windows, date).filter(
    (slot) => !blocked.has(slot) && !externalBusy.has(slot) && !takenSet.has(`${date} ${slot}`),
  );
}
