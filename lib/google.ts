import { CLINIC_TIMEZONE } from "@/lib/calendar/types";
import { getGoogleAccount, updateGoogleTokens } from "@/lib/db";
import { siteUrl } from "@/lib/seo";

export { CLINIC_TIMEZONE };

const AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const CALENDAR_BASE = "https://www.googleapis.com/calendar/v3";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
  "openid",
  "email",
];

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri(): string {
  return process.env.GOOGLE_REDIRECT_URI || `${siteUrl()}/api/integrations/google/callback`;
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    state,
  });
  return `${AUTH_BASE}?${params.toString()}`;
}

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  id_token?: string;
};

async function postForm(url: string, params: Record<string, string>): Promise<TokenResponse | null> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params).toString(),
    });
    const payload = (await response.json()) as TokenResponse & {
      error?: string;
      error_description?: string;
    };
    if (!response.ok || !payload.access_token) {
      console.error(
        "[google] falha ao obter token:",
        response.status,
        payload.error,
        payload.error_description,
      );
      return null;
    }
    return payload;
  } catch (error) {
    console.error("[google] erro de rede ao obter token:", (error as Error).message);
    return null;
  }
}

export async function exchangeCode(code: string): Promise<TokenResponse | null> {
  return postForm(TOKEN_URL, {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirect_uri: googleRedirectUri(),
    grant_type: "authorization_code",
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse | null> {
  return postForm(TOKEN_URL, {
    refresh_token: refreshToken,
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    grant_type: "refresh_token",
  });
}

export async function fetchUserinfo(
  accessToken: string,
): Promise<{ email?: string; sub?: string } | null> {
  try {
    const response = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return null;
    return (await response.json()) as { email?: string; sub?: string };
  } catch {
    return null;
  }
}

/** Devolve um access_token válido, renovando via refresh_token quando necessário. */
export async function getValidAccessToken(slug: string): Promise<string | null> {
  const account = await getGoogleAccount(slug);
  if (!account) return null;

  const stillValid =
    account.accessToken &&
    account.accessTokenExpires &&
    new Date(account.accessTokenExpires).getTime() > Date.now() + 60_000;
  if (stillValid) return account.accessToken;

  if (!account.refreshToken) return account.accessToken ?? null;

  const refreshed = await refreshAccessToken(account.refreshToken);
  if (!refreshed?.access_token) return account.accessToken ?? null;

  const expires = new Date(Date.now() + (refreshed.expires_in ?? 3600) * 1000).toISOString();
  await updateGoogleTokens(slug, refreshed.access_token, expires, refreshed.scope);
  return refreshed.access_token;
}

export type BusyInterval = { start: string; end: string };

/** Lê os períodos ocupados do calendário (freebusy). Retorna null em caso de falha. */
export async function fetchGoogleBusy(
  slug: string,
  timeMinISO: string,
  timeMaxISO: string,
): Promise<BusyInterval[] | null> {
  const token = await getValidAccessToken(slug);
  if (!token) return null;
  const account = await getGoogleAccount(slug);
  const calendarId = account?.calendarId || "primary";

  try {
    const response = await fetch(`${CALENDAR_BASE}/freebusy`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        timeMin: timeMinISO,
        timeMax: timeMaxISO,
        items: [{ id: calendarId }],
      }),
    });
    if (!response.ok) {
      console.error("[google] freebusy falhou:", response.status);
      return null;
    }
    const payload = (await response.json()) as {
      calendars?: Record<string, { busy?: BusyInterval[] }>;
    };
    return payload.calendars?.[calendarId]?.busy ?? [];
  } catch (error) {
    console.error("[google] erro de rede (freebusy):", (error as Error).message);
    return null;
  }
}

export type CalendarEventInput = {
  summary: string;
  description?: string;
  location?: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  timeZone?: string;
};

/** Cria um evento no calendário. Retorna o id do evento, ou null em caso de falha. */
export async function createGoogleEvent(
  slug: string,
  input: CalendarEventInput,
): Promise<string | null> {
  const token = await getValidAccessToken(slug);
  if (!token) return null;
  const account = await getGoogleAccount(slug);
  const calendarId = account?.calendarId || "primary";
  const timeZone = input.timeZone || CLINIC_TIMEZONE;

  try {
    const response = await fetch(
      `${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: input.summary,
          description: input.description,
          location: input.location,
          start: { dateTime: `${input.date}T${input.start}:00`, timeZone },
          end: { dateTime: `${input.date}T${input.end}:00`, timeZone },
        }),
      },
    );
    if (!response.ok) {
      console.error("[google] criar evento falhou:", response.status, await response.text());
      return null;
    }
    const payload = (await response.json()) as { id?: string };
    return payload.id ?? null;
  } catch (error) {
    console.error("[google] erro de rede (criar evento):", (error as Error).message);
    return null;
  }
}

/** Remove um evento do calendário. Considera já removido (404/410) como sucesso. */
export async function deleteGoogleEvent(slug: string, eventId: string): Promise<boolean> {
  const token = await getValidAccessToken(slug);
  if (!token) return false;
  const account = await getGoogleAccount(slug);
  const calendarId = account?.calendarId || "primary";

  try {
    const response = await fetch(
      `${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok && response.status !== 404 && response.status !== 410) {
      console.error("[google] remover evento falhou:", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[google] erro de rede (remover evento):", (error as Error).message);
    return false;
  }
}
