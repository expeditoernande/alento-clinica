import {
  CLINIC_UTC_OFFSET,
  type BusyInterval,
  type CalendarProvider,
} from "@/lib/calendar/types";

/**
 * Provedor de agenda simulado, em memória. Serve para desenvolver e testar todo
 * o fluxo (ler ocupados, criar e remover eventos) sem depender de nenhuma API
 * externa. Ativa-se com `AGENDA_PROVIDER=mock`.
 *
 * Ocupações iniciais podem ser semeadas com a variável `AGENDA_MOCK_BUSY`, um
 * JSON de intervalos ISO, ex.:
 *   AGENDA_MOCK_BUSY=[{"start":"2026-10-15T13:00:00-03:00","end":"2026-10-15T14:00:00-03:00"}]
 */
type MockEvent = { id: string; summary: string; start: string; end: string };

const globalStore = globalThis as typeof globalThis & {
  __alMockCalendar?: Map<string, MockEvent[]>;
};
const store = (globalStore.__alMockCalendar ??= new Map<string, MockEvent[]>());

function seedEvents(): MockEvent[] {
  const raw = process.env.AGENDA_MOCK_BUSY;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<{ start: string; end: string; summary?: string }>;
    return parsed
      .map((item, index) => ({
        id: `mock-seed-${index}`,
        summary: item.summary ?? "Ocupado (mock)",
        start: new Date(item.start).toISOString(),
        end: new Date(item.end).toISOString(),
      }))
      .filter((item) => !Number.isNaN(new Date(item.start).getTime()));
  } catch (error) {
    console.error("[agenda] AGENDA_MOCK_BUSY inválido:", (error as Error).message);
    return [];
  }
}

function eventsFor(slug: string): MockEvent[] {
  let list = store.get(slug);
  if (!list) {
    list = seedEvents();
    store.set(slug, list);
  }
  return list;
}

export function mockProvider(slug: string): CalendarProvider {
  return {
    id: "mock",
    label: "Agenda simulada (mock)",

    async listBusy(timeMinISO: string, timeMaxISO: string): Promise<BusyInterval[] | null> {
      const min = new Date(timeMinISO).getTime();
      const max = new Date(timeMaxISO).getTime();
      return eventsFor(slug)
        .filter((event) => new Date(event.start).getTime() < max && new Date(event.end).getTime() > min)
        .map((event) => ({ start: event.start, end: event.end }));
    },

    async createEvent(input): Promise<string | null> {
      const id = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const list = store.get(slug) ?? seedEvents();
      list.push({
        id,
        summary: input.summary,
        start: new Date(`${input.date}T${input.start}:00${CLINIC_UTC_OFFSET}`).toISOString(),
        end: new Date(`${input.date}T${input.end}:00${CLINIC_UTC_OFFSET}`).toISOString(),
      });
      store.set(slug, list);
      return id;
    },

    async deleteEvent(eventId: string): Promise<boolean> {
      for (const [key, list] of store) {
        const index = list.findIndex((event) => event.id === eventId);
        if (index >= 0) {
          list.splice(index, 1);
          store.set(key, list);
          return true;
        }
      }
      return true;
    },
  };
}
