import { NextResponse } from "next/server";
import { currentUser, isAdmin } from "@/lib/auth";
import { findUserByEmail, updateUserRole } from "@/lib/db";
import type { Role } from "@/lib/types";
import { clean, isEmail } from "@/lib/validation";
import { psychologists } from "@/lib/site";

export async function POST(request: Request) {
  const admin = await currentUser();
  if (!isAdmin(admin)) {
    return NextResponse.json({ ok: false, message: "Acesso restrito." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "Requisição inválida." }, { status: 400 });
  }

  const email = clean(body.email, 120).toLowerCase();
  const role: Role = body.role === "psychologist" ? "psychologist" : "patient";
  const slug = clean(body.slug, 60);

  if (!isEmail(email)) {
    return NextResponse.json({ ok: false, message: "Informe um e-mail válido." }, { status: 422 });
  }

  let psychologistSlug: string | null = null;
  if (role === "psychologist") {
    if (!psychologists.some((person) => person.slug === slug)) {
      return NextResponse.json(
        { ok: false, message: "Escolha um psicólogo válido da lista." },
        { status: 422 },
      );
    }
    psychologistSlug = slug;
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ ok: false, message: "Conta não encontrada." }, { status: 404 });
  }

  await updateUserRole(user.id, role, psychologistSlug);
  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role, psychologistSlug } });
}
