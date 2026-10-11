import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { emailConfigured } from "@/lib/email";
import { issuePasswordReset } from "@/lib/reset";
import { clientKey, isBot, rateLimit, validateForgotPassword } from "@/lib/validation";

const GENERIC_MESSAGE =
  "Se existir uma conta com este e-mail, enviamos um link para redefinir a senha.";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request.headers, "forgot-password"), 5, 60_000);
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

  if (isBot(body)) {
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  }

  const { data, errors } = validateForgotPassword(body);
  if (!data) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  // Resposta genérica para não revelar se o e-mail está cadastrado.
  if (emailConfigured()) {
    const user = await findUserByEmail(data.email);
    if (user) {
      await issuePasswordReset({ id: user.id, name: user.name, email: user.email });
    }
  }

  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}
