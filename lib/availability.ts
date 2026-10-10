import { listBlocks, listWeeklyWindows, takenSlots } from "@/lib/db";
import { SESSION_SLOTS } from "@/lib/site";

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

export async function availableSlots(
  slug: string,
  date: string,
  excludeId?: string,
): Promise<string[]> {
  const [windows, blocks, taken] = await Promise.all([
    listWeeklyWindows(slug),
    listBlocks(slug),
    takenSlots(slug, excludeId),
  ]);
  const takenSet = new Set(taken.filter((entry) => entry.startsWith(`${date} `)));
  const blocked = new Set(blockedSlotsFor(blocks, date));
  return baseSlotsFor(windows, date).filter(
    (slot) => !blocked.has(slot) && !takenSet.has(`${date} ${slot}`),
  );
}
