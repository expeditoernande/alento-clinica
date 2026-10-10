import { NextResponse } from "next/server";
import { currentPsychologistSlug } from "@/lib/auth";
import { createBlock, deleteBlock, listBlocks } from "@/lib/db";
import { validateBlock } from "@/lib/validation";

export async function POST(request: Request) {
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

  const { data, errors } = validateBlock(body);
  if (!data) return NextResponse.json({ ok: false, errors }, { status: 422 });

  await createBlock(slug, data);
  const blocks = await listBlocks(slug);
  return NextResponse.json({ ok: true, blocks }, { status: 201 });
}

export async function DELETE(request: Request) {
  const slug = await currentPsychologistSlug();
  if (!slug) {
    return NextResponse.json({ ok: false, message: "Acesso restrito a psicólogos." }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id") ?? "";
  const removed = id ? await deleteBlock(slug, id) : false;
  if (!removed) {
    return NextResponse.json({ ok: false, message: "Bloqueio não encontrado." }, { status: 404 });
  }

  const blocks = await listBlocks(slug);
  return NextResponse.json({ ok: true, blocks });
}
