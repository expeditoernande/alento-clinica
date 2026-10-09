import { NextResponse } from "next/server";
import { pingDatabase, storageKind } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const database = await pingDatabase();
  return NextResponse.json({
    ok: true,
    app: "alento-clinica",
    armazenamento: storageKind(),
    banco: database,
    horario: new Date().toISOString(),
  });
}
