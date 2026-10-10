import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { takenSlots } from "@/lib/db";
import { psychologists } from "@/lib/site";

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Faça login para continuar." }, { status: 401 });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") ?? "";
  const exclude = url.searchParams.get("exclude") ?? undefined;

  if (!psychologists.some((person) => person.slug === slug)) {
    return NextResponse.json({ ok: false, taken: [] }, { status: 404 });
  }

  const taken = await takenSlots(slug, exclude);
  return NextResponse.json({ ok: true, taken });
}
