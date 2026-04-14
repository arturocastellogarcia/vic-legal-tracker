import { NextResponse } from "next/server";
import { db, comentarios, actividad } from "@/lib/db";
import { eq, asc, isNull, and } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ expedienteId: string }> }
) {
  await requireSession();
  const { expedienteId } = await params;

  const allComentarios = await db
    .select()
    .from(comentarios)
    .where(
      and(
        eq(comentarios.expedienteId, expedienteId),
        isNull(comentarios.deletedAt)
      )
    )
    .orderBy(asc(comentarios.createdAt));

  return NextResponse.json(allComentarios);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ expedienteId: string }> }
) {
  const session = await requireSession();
  const { expedienteId } = await params;

  const body = await request.json();
  const { contenido, pasoExpedienteId } = body;

  if (!contenido?.trim()) {
    return NextResponse.json(
      { error: "El comentario no puede estar vacío" },
      { status: 400 }
    );
  }

  const [comment] = await db
    .insert(comentarios)
    .values({
      expedienteId,
      pasoExpedienteId: pasoExpedienteId || null,
      usuarioId: session.id,
      contenido: contenido.trim(),
    })
    .returning();

  // Log activity
  await db.insert(actividad).values({
    expedienteId,
    usuarioId: session.id,
    accion: "comentario",
    descripcion: `Comentario añadido: "${contenido.trim().substring(0, 80)}${contenido.trim().length > 80 ? "…" : ""}"`,
    metadata: { comentarioId: comment.id, pasoExpedienteId },
  });

  return NextResponse.json(comment, { status: 201 });
}
