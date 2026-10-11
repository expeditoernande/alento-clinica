import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { emailConfigured } from "@/lib/email";
import { issueVerification } from "@/lib/verification";
import { clean, clientKey, isEmail, isBot, rateLimit } from "@/lib/validation";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request.headers, "verify-resend"), 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: "Muitas solicitações. Aguarde um instante." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "Requisição inválida." }, { status: 400 });
  }

  const email = clean(body.email, 120).toLowerCase();

  // Resposta genérica para não revelar se o e-mail existe.
  if (isBot(body) || !isEmail(email) || !emailConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const user = await findUserByEmail(email);
  if (user && !user.emailVerified) {
    await issueVerification({ id: user.id, name: user.name, email: user.email });
  }

  return NextResponse.json({ ok: true });
}
