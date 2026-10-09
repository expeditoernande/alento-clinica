import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { clientKey, isBot, rateLimit, validateLogin } from "@/lib/validation";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request.headers, "login"), 8, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: "Muitas tentativas. Aguarde um minuto." },
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
    return NextResponse.json({ ok: true, user: null });
  }

  const { data, errors } = validateLogin(body);
  if (!data) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const result = await authenticate(data.email, data.password);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: "E-mail ou senha incorretos." },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true, user: result.user });
}
