import { NextResponse } from "next/server";
import { currentPsychologistSlug } from "@/lib/auth";
import { getGoogleAccount } from "@/lib/db";
import { googleConfigured } from "@/lib/google";

export async function GET() {
  const slug = await currentPsychologistSlug();
  if (!slug) {
    return NextResponse.json(
      { ok: false, message: "Acesso restrito a psicólogos." },
      { status: 403 },
    );
  }

  const account = await getGoogleAccount(slug);
  return NextResponse.json({
    ok: true,
    configured: googleConfigured(),
    connected: Boolean(account),
    email: account?.email ?? "",
    connectedAt: account?.connectedAt ?? null,
  });
}
