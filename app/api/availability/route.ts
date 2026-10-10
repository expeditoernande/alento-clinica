import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { availableSlots } from "@/lib/availability";
import { psychologists } from "@/lib/site";

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Faça login para continuar." }, { status: 401 });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") ?? "";
  const date = url.searchParams.get("date") ?? "";
  const exclude = url.searchParams.get("exclude") ?? undefined;

  if (!psychologists.some((person) => person.slug === slug) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ ok: false, available: [] }, { status: 400 });
  }

  const available = await availableSlots(slug, date, exclude);
  return NextResponse.json({ ok: true, available });
}
