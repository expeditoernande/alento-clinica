import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { cancelAppointment } from "@/lib/db";

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
