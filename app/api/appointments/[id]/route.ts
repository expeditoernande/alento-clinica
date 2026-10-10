import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { cancelAppointment, rescheduleAppointment } from "@/lib/db";
import { clientKey, rateLimit, validateReschedule } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Faça login para continuar." }, { status: 401 });
  }

  const limit = rateLimit(clientKey(request.headers, `reschedule:${user.id}`), 15, 60_000);
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

  const { data, errors } = validateReschedule(body);
  if (!data) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const { id } = await params;
  const result = await rescheduleAppointment(user.id, id, data);
  if (!result.ok) {
    if (result.conflict) {
      return NextResponse.json(
        { ok: false, errors: { time: "Esse horário acabou de ser ocupado. Escolha outro." } },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, message: "Agendamento não encontrado ou já cancelado." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Faça login para continuar." }, { status: 401 });
  }

  const { id } = await params;
  const done = await cancelAppointment(user.id, id);
  if (!done) {
    return NextResponse.json(
      { ok: false, message: "Agendamento não encontrado ou já cancelado." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
