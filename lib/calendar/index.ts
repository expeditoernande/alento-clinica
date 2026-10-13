import { agendaApiProvider, type AgendaApiConfig } from "@/lib/calendar/api";
import { googleProvider } from "@/lib/calendar/google";
import { mockProvider } from "@/lib/calendar/mock";
import type { BusyInterval, CalendarProvider, CalendarProviderId } from "@/lib/calendar/types";
import { getGoogleAccount } from "@/lib/db";

export type { AgendaApiConfig } from "@/lib/calendar/api";
export type {
  BusyInterval,
  CalendarEventInput,
  CalendarProvider,
  CalendarProviderId,
} from "@/lib/calendar/types";

/**
 * Monta a configuração do provedor de API externa a partir do ambiente. Quando
 * a agenda for por psicólogo, é aqui que se leria a config do banco.
 */
export function agendaApiConfig(): AgendaApiConfig | null {
  const baseUrl = process.env.AGENDA_API_URL;
  if (!baseUrl) return null;
  return {
    baseUrl,
    apiKey: process.env.AGENDA_API_KEY,
    busyPath: process.env.AGENDA_BUSY_PATH,
    eventsPath: process.env.AGENDA_EVENTS_PATH,
  };
}

/**
 * Resolve qual provedor usar, em ordem de prioridade:
 *   1. `AGENDA_PROVIDER` explícito (google | api | mock);
 *   2. `AGENDA_API_URL` definido -> api;
 *   3. caso contrário -> google.
 */
export function activeProviderId(): CalendarProviderId {
  const configured = (process.env.AGENDA_PROVIDER || "").trim().toLowerCase();
  if (configured === "mock" || configured === "api" || configured === "google") {
    return configured;
  }
  if (process.env.AGENDA_API_URL) return "api";
  return "google";
}

/** Devolve o provedor pronto para uso, ou `null` se não houver integração ativa. */
export async function getCalendarProvider(slug: string): Promise<CalendarProvider | null> {
  const id = activeProviderId();

  if (id === "mock") return mockProvider(slug);

  if (id === "api") {
    const config = agendaApiConfig();
    return config ? agendaApiProvider(slug, config) : null;
  }

  const account = await getGoogleAccount(slug);
  return account ? googleProvider(slug) : null;
}

/**
 * Lê os períodos ocupados externos de um psicólogo. `null` = falha ou sem
 * integração; `[]` = agenda conectada e livre no intervalo.
 */
export async function calendarBusy(
  slug: string,
  timeMinISO: string,
  timeMaxISO: string,
): Promise<BusyInterval[] | null> {
  const provider = await getCalendarProvider(slug);
  if (!provider) return null;
  return provider.listBusy(timeMinISO, timeMaxISO);
}
