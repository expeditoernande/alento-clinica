import { NextResponse } from "next/server";
import { resetPasswordWithToken, startSession } from "@/lib/auth";
import { clean, clientKey, isBot, rateLimit, validateResetPassword } from "@/lib/validation";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request.headers, "reset-password"), 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: "Muitas tentativas. Aguarde um instante." },
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
    return NextResponse.json({ ok: true });
  }

  const token = clean(body.token, 200);
  const { data, errors } = validateResetPassword(body);
  if (!data) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }
  if (!token) {
    return NextResponse.json(
      { ok: false, errors: { token: "Link inválido." }, message: "Link inválido ou expirado." },
      { status: 422 },
    );
  }

  const result = await resetPasswordWithToken(token, data.password);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: "Link inválido ou expirado. Solicite um novo." },
      { status: 422 },
    );
  }

  await startSession(result.userId);
  return NextResponse.json({ ok: true });
}
