import { NextResponse } from "next/server";
import { db, notificaciones } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";

export async function GET() {
  const session = await requireSession();

  const items = await db
    .select()
    .from(notificaciones)
    .where(eq(notificaciones.usuarioId, session.id))
    .orderBy(desc(notificaciones.createdAt))
    .limit(20);

  return NextResponse.json(items);
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  const body = await request.json();
  const { id, leida } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const [updated] = await db
    .update(notificaciones)
    .set({ leida: leida ?? true })
    .where(eq(notificaciones.id, id))
    .returning();

  return NextResponse.json(updated);
}
