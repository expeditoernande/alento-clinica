import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createAppointment, listAppointments } from "@/lib/db";
import { clientKey, code, rateLimit, validateAppointment } from "@/lib/validation";
import { psychologists } from "@/lib/site";
import type { StoredAppointment } from "@/lib/types";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Faça login para continuar." }, { status: 401 });
  }
  const appointments = await listAppointments(user.id);
  return NextResponse.json({ ok: true, appointments });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Faça login para agendar." }, { status: 401 });
  }

  const limit = rateLimit(clientKey(request.headers, `appointment:${user.id}`), 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: "Muitos agendamentos seguidos. Aguarde um instante." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "Requisição inválida." }, { status: 400 });
  }

  const { data, errors } = validateAppointment(body);
  if (!data) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const person = psychologists.find((item) => item.slug === data.psychologistSlug);
  if (!person) {
    return NextResponse.json(
      { ok: false, errors: { psychologistSlug: "Psicólogo não encontrado." } },
      { status: 404 },
    );
  }
  if (data.mode === "presencial" && !person.inPerson) {
    return NextResponse.json(
      { ok: false, errors: { mode: "Este psicólogo não atende presencialmente." } },
      { status: 422 },
    );
  }

  const appointment: StoredAppointment = {
    id: randomUUID(),
    code: code(),
    userId: user.id,
    psychologistSlug: person.slug,
    date: data.date,
    time: data.time,
    mode: data.mode,
    notes: data.notes,
    status: "agendada",
    createdAt: new Date().toISOString(),
  };

  const result = await createAppointment(appointment);
  if (!result.ok) {
    if (result.conflict) {
      return NextResponse.json(
        { ok: false, errors: { time: "Esse horário acabou de ser ocupado. Escolha outro." } },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, message: "Não foi possível agendar agora." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, appointment }, { status: 201 });
}
