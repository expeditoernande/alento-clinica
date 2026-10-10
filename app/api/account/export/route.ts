import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { listAppointments } from "@/lib/db";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Faça login para continuar." }, { status: 401 });
  }

  const appointments = await listAppointments(user.id);
  const payload = {
    exportadoEm: new Date().toISOString(),
    conta: user,
    agendamentos: appointments,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="alento-meus-dados.json"',
    },
  });
}
