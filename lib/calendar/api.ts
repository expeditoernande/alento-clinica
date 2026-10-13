import {
  CLINIC_TIMEZONE,
  CLINIC_UTC_OFFSET,
  type BusyInterval,
  type CalendarProvider,
} from "@/lib/calendar/types";

/**
 * Provedor de agenda exposto por API HTTP (ex.: o produto do Caio). Basta o
 * contrato abaixo para ligar sem mexer no resto do sistema:
 *
 *   GET    {baseUrl}{busyPath}?from=<ISO>&to=<ISO>  -> ocupados
 *   POST   {baseUrl}{eventsPath}                     -> cria, devolve { id }
 *   DELETE {baseUrl}{eventsPath}/{id}                -> remove
 *
 * A resposta de ocupados pode vir como array direto, `{ busy: [...] }` ou
 * `{ events: [...] }`, cada item em `{ start, end }` (ISO) ou no formato do
 * Google `{ start: { dateTime | date }, end: { ... } }`. Quando o Caio mandar o
 * contrato real, só estes dois arquivos (paths/mapeamento) precisam mudar.
 */
export type AgendaApiConfig = {
  baseUrl: string;
  apiKey?: string;
  busyPath?: string;
  eventsPath?: string;
};

const DEFAULT_BUSY_PATH = "/busy";
const DEFAULT_EVENTS_PATH = "/events";

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function authHeaders(config: AgendaApiConfig): Record<string, string> {
  if (!config.apiKey) return {};
  return { Authorization: `Bearer ${config.apiKey}`, "X-Api-Key": config.apiKey };
}

function normalizeInstant(value: unknown): string | null {
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  if (value && typeof value === "object") {
    const nested = value as { dateTime?: unknown; date?: unknown };
    if (typeof nested.dateTime === "string") return normalizeInstant(nested.dateTime);
    if (typeof nested.date === "string") {
      return normalizeInstant(`${nested.date}T00:00:00${CLINIC_UTC_OFFSET}`);
    }
  }
  return null;
}

function parseBusy(payload: unknown): BusyInterval[] {
  const holder = (payload ?? {}) as { busy?: unknown[]; events?: unknown[] };
  const raw: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(holder.busy)
      ? holder.busy
      : Array.isArray(holder.events)
        ? holder.events
        : [];

  const intervals: BusyInterval[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const start = normalizeInstant((item as { start?: unknown }).start);
    const end = normalizeInstant((item as { end?: unknown }).end);
    if (start && end) intervals.push({ start, end });
  }
  return intervals;
}

export function agendaApiProvider(slug: string, config: AgendaApiConfig): CalendarProvider {
  const baseUrl = trimTrailingSlash(config.baseUrl);
  const busyPath = config.busyPath || DEFAULT_BUSY_PATH;
  const eventsPath = config.eventsPath || DEFAULT_EVENTS_PATH;

  return {
    id: "api",
    label: "Agenda externa (API)",

    async listBusy(timeMinISO: string, timeMaxISO: string): Promise<BusyInterval[] | null> {
      const url = `${baseUrl}${busyPath}?from=${encodeURIComponent(timeMinISO)}&to=${encodeURIComponent(timeMaxISO)}`;
      try {
        const response = await fetch(url, { headers: authHeaders(config) });
        if (!response.ok) {
          console.error("[agenda] listBusy falhou:", response.status);
          return null;
        }
        return parseBusy(await response.json());
      } catch (error) {
        console.error("[agenda] erro de rede (listBusy):", (error as Error).message);
        return null;
      }
    },

    async createEvent(input): Promise<string | null> {
      const timeZone = input.timeZone || CLINIC_TIMEZONE;
      const body = {
        summary: input.summary,
        description: input.description ?? "",
        location: input.location ?? "",
        start: { dateTime: `${input.date}T${input.start}:00${CLINIC_UTC_OFFSET}`, timeZone },
        end: { dateTime: `${input.date}T${input.end}:00${CLINIC_UTC_OFFSET}`, timeZone },
        externalRef: slug,
      };
      try {
        const response = await fetch(`${baseUrl}${eventsPath}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders(config) },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          console.error("[agenda] criar evento falhou:", response.status);
          return null;
        }
        const payload = (await response.json()) as
          | { id?: string; event?: { id?: string } }
          | null;
        return payload?.id ?? payload?.event?.id ?? null;
      } catch (error) {
        console.error("[agenda] erro de rede (criar evento):", (error as Error).message);
        return null;
      }
    },

    async deleteEvent(eventId: string): Promise<boolean> {
      try {
        const response = await fetch(`${baseUrl}${eventsPath}/${encodeURIComponent(eventId)}`, {
          method: "DELETE",
          headers: authHeaders(config),
        });
        if (!response.ok && response.status !== 404 && response.status !== 410) {
          console.error("[agenda] remover evento falhou:", response.status);
          return false;
        }
        return true;
      } catch (error) {
        console.error("[agenda] erro de rede (remover evento):", (error as Error).message);
        return false;
      }
    },
  };
}
