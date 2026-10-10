import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { updateUser } from "@/lib/db";
import { clientKey, rateLimit, validateProfile } from "@/lib/validation";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Faça login para continuar." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, user });
}

export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Faça login para continuar." }, { status: 401 });
  }

  const limit = rateLimit(clientKey(request.headers, `account:${user.id}`), 12, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: "Muitas alterações seguidas. Aguarde um instante." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "Requisição inválida." }, { status: 400 });
  }

  const { data, errors } = validateProfile(body);
  if (!data) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const result = await updateUser({
    id: user.id,
    name: user.name,
    email: data.email,
    phone: data.phone,
  });
  if (!result.ok) {
    if (result.duplicate) {
      return NextResponse.json(
        { ok: false, errors: { email: "Já existe uma conta com este e-mail." } },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, message: "Não foi possível salvar seus dados agora." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    user: { ...user, email: data.email, phone: data.phone },
  });
}
