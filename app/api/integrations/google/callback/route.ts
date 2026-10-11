import { NextResponse, type NextRequest } from "next/server";
import { currentPsychologistSlug } from "@/lib/auth";
import { getGoogleAccount, saveGoogleAccount } from "@/lib/db";
import { exchangeCode, fetchUserinfo, googleConfigured } from "@/lib/google";

export async function GET(request: NextRequest) {
  const agenda = new URL("/agenda", request.url);
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get("alento_google_state")?.value;
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  const slug = await currentPsychologistSlug();
  if (!slug) {
    agenda.searchParams.set("google", "restrito");
    return NextResponse.redirect(agenda);
  }
  if (error) {
    agenda.searchParams.set("google", "negado");
    return NextResponse.redirect(agenda);
  }
  if (!googleConfigured() || !code || !state || !cookieState || state !== cookieState) {
    agenda.searchParams.set("google", "erro");
    return NextResponse.redirect(agenda);
  }

  const tokens = await exchangeCode(code);
  if (!tokens?.access_token) {
    agenda.searchParams.set("google", "erro");
    return NextResponse.redirect(agenda);
  }

  const info = await fetchUserinfo(tokens.access_token);
  const existing = await getGoogleAccount(slug);
  const expires = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString();

  await saveGoogleAccount({
    psychologistSlug: slug,
    googleSub: info?.sub ?? existing?.googleSub ?? null,
    email: info?.email ?? existing?.email ?? "",
    refreshToken: tokens.refresh_token ?? existing?.refreshToken ?? null,
    accessToken: tokens.access_token,
    accessTokenExpires: expires,
    scopes: tokens.scope ?? existing?.scopes ?? "",
    calendarId: existing?.calendarId ?? "primary",
    connectedAt: new Date().toISOString(),
  });

  agenda.searchParams.set("google", "conectado");
  const response = NextResponse.redirect(agenda);
  response.cookies.delete("alento_google_state");
  return response;
}
