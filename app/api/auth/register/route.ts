import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";
import { clientKey, isBot, rateLimit, validateRegister } from "@/lib/validation";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request.headers, "register"), 6, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: "Muitas tentativas. Tente novamente em instantes." },
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
    // Responde como sucesso para não dar pistas ao bot.
    return NextResponse.json({ ok: true, user: null });
  }

  const { data, errors } = validateRegister(body);
  if (!data) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const result = await registerUser(data);
  if (!result.ok) {
    if (result.duplicate) {
      return NextResponse.json(
        { ok: false, errors: { email: "Já existe uma conta com este e-mail." } },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, message: "Não foi possível criar sua conta agora." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, user: result.user }, { status: 201 });
}
