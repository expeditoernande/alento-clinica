/** Fuso oficial da clínica. */
export const CLINIC_TIMEZONE = "America/Sao_Paulo";

/**
 * Deslocamento UTC de America/Sao_Paulo. O Brasil não usa mais horário de verão
 * (desde 2019), então o deslocamento é fixo em UTC-3.
 */
export const CLINIC_UTC_OFFSET = "-03:00";

export type BusyInterval = { start: string; end: string };

export type CalendarEventInput = {
  summary: string;
  description?: string;
  location?: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  timeZone?: string;
};

export type CalendarProviderId = "google" | "api" | "mock";

/**
 * Contrato de um provedor de agenda. Qualquer integração (Google, API externa,
 * mock) implementa estas operações, e o resto do sistema só fala com esta
 * interface — por isso trocar/adicionar provedor não exige retrabalho.
 */
export type CalendarProvider = {
  id: CalendarProviderId;
  label: string;
  /** Lê os períodos ocupados. `null` = falha ao consultar; `[]` = sem ocupação. */
  listBusy: (timeMinISO: string, timeMaxISO: string) => Promise<BusyInterval[] | null>;
  /** Cria um evento e devolve o id externo. `null` = falha. */
  createEvent: (input: CalendarEventInput) => Promise<string | null>;
  /** Remove um evento. `true` = removido (ou já inexistente); `false` = falha. */
  deleteEvent: (eventId: string) => Promise<boolean>;
};
