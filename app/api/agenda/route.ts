import { NextResponse } from "next/server";
import { currentPsychologistSlug } from "@/lib/auth";
import { listBlocks, listWeeklyWindows, replaceWeeklyWindows } from "@/lib/db";
import { validateWeeklyWindows } from "@/lib/validation";

export async function GET() {
  const slug = await currentPsychologistSlug();
  if (!slug) {
    return NextResponse.json({ ok: false, message: "Acesso restrito a psicólogos." }, { status: 403 });
  }

  const [windows, blocks] = await Promise.all([listWeeklyWindows(slug), listBlocks(slug)]);
  return NextResponse.json({ ok: true, slug, windows, blocks });
}

export async function PUT(request: Request) {
  const slug = await currentPsychologistSlug();
  if (!slug) {
    return NextResponse.json({ ok: false, message: "Acesso restrito a psicólogos." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "Requisição inválida." }, { status: 400 });
  }

  const { data, errors } = validateWeeklyWindows(body);
  if (!data) return NextResponse.json({ ok: false, errors }, { status: 422 });

  await replaceWeeklyWindows(slug, data);
  const windows = await listWeeklyWindows(slug);
  return NextResponse.json({ ok: true, windows });
}
