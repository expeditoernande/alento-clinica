import { NextResponse } from "next/server";
import { currentPsychologistSlug } from "@/lib/auth";
import { deleteGoogleAccount } from "@/lib/db";

export async function POST() {
  const slug = await currentPsychologistSlug();
  if (!slug) {
    return NextResponse.json(
      { ok: false, message: "Acesso restrito a psicólogos." },
      { status: 403 },
    );
  }

  await deleteGoogleAccount(slug);
  return NextResponse.json({ ok: true });
}
