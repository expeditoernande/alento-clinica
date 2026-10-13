import { createGoogleEvent, deleteGoogleEvent, fetchGoogleBusy } from "@/lib/google";
import type { CalendarProvider } from "@/lib/calendar/types";

/** Adapta a integração Google existente ao contrato comum de `CalendarProvider`. */
export function googleProvider(slug: string): CalendarProvider {
  return {
    id: "google",
    label: "Google Agenda",
    listBusy: (timeMinISO, timeMaxISO) => fetchGoogleBusy(slug, timeMinISO, timeMaxISO),
    createEvent: (input) => createGoogleEvent(slug, input),
    deleteEvent: (eventId) => deleteGoogleEvent(slug, eventId),
  };
}
