import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createApplication } from "@/lib/db";
import { clientKey, isBot, rateLimit, validateApplication } from "@/lib/validation";
import type { StoredApplication } from "@/lib/types";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request.headers, "application"), 4, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: "Você já enviou há pouco. Tente novamente mais tarde." },
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

  const { data, errors } = validateApplication(body);
  if (!data) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const application: StoredApplication = {
    id: randomUUID(),
    name: data.name,
    email: data.email,
    phone: data.phone,
    crp: data.crp,
    approach: data.approach,
    message: data.message,
    createdAt: new Date().toISOString(),
  };

  const result = await createApplication(application);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível registrar seu currículo agora." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
