import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { currentPsychologistSlug } from "@/lib/auth";
import { buildAuthUrl, googleConfigured } from "@/lib/google";

export async function GET(request: NextRequest) {
  const agenda = new URL("/agenda", request.url);

  const slug = await currentPsychologistSlug();
  if (!slug) {
    agenda.searchParams.set("google", "restrito");
    return NextResponse.redirect(agenda);
  }
  if (!googleConfigured()) {
    agenda.searchParams.set("google", "naoconfigurado");
    return NextResponse.redirect(agenda);
  }

  const state = randomBytes(16).toString("hex");
  const response = NextResponse.redirect(buildAuthUrl(state));
  response.cookies.set("alento_google_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}
