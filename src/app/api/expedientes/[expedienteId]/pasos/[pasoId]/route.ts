import { NextResponse } from "next/server";
import { db, pasosExpediente, expedientes, actividad, pasosFlujo } from "@/lib/db";
import { eq, and, asc } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ expedienteId: string; pasoId: string }> }
) {
  const session = await requireSession();
  const { expedienteId, pasoId } = await params;

  const body = await request.json();
  const { estado, comentario } = body;

  if (!estado) {
    return NextResponse.json({ error: "estado is required" }, { status: 400 });
  }

  // Get current paso
  const [paso] = await db
    .select()
    .from(pasosExpediente)
    .where(
      and(
        eq(pasosExpediente.id, pasoId),
        eq(pasosExpediente.expedienteId, expedienteId)
      )
    )
    .limit(1);

  if (!paso) {
    return NextResponse.json({ error: "Paso no encontrado" }, { status: 404 });
  }

  // Get the flujo definition for this paso
  const [pasoFlujo] = await db
    .select()
    .from(pasosFlujo)
    .where(eq(pasosFlujo.id, paso.pasoFlujoId))
    .limit(1);

  // Check if previous bloqueante steps are completed
  if (estado === "completado") {
    const allPasos = await db
      .select({
        paso: pasosExpediente,
        flujo: pasosFlujo,
      })
      .from(pasosExpediente)
      .innerJoin(pasosFlujo, eq(pasosExpediente.pasoFlujoId, pasosFlujo.id))
      .where(eq(pasosExpediente.expedienteId, expedienteId))
      .orderBy(asc(pasosExpediente.orden));

    // Check all previous bloqueante steps are completed
    for (const p of allPasos) {
      if (p.paso.orden >= paso.orden) break;
      if (
        p.flujo.bloqueante &&
        p.paso.estado !== "completado" &&
        p.paso.estado !== "omitido"
      ) {
        return NextResponse.json(
          {
            error: `No puedes completar este paso: el paso bloqueante "${p.flujo.titulo}" (paso ${p.paso.orden}) aún no está completado.`,
          },
          { status: 400 }
        );
      }
    }
  }

  // Update paso
  const updates: Record<string, unknown> = { estado };
  if (estado === "completado") {
    updates.completadoEn = new Date();
    updates.completadoPor = session.id;
  }
  if (estado === "en_curso" && !paso.iniciadoEn) {
    updates.iniciadoEn = new Date();
  }
  if (comentario) {
    updates.comentario = comentario;
  }

  const [updated] = await db
    .update(pasosExpediente)
    .set(updates)
    .where(eq(pasosExpediente.id, pasoId))
    .returning();

  // If completed, advance to next pending step
  if (estado === "completado") {
    const nextPasos = await db
      .select()
      .from(pasosExpediente)
      .where(eq(pasosExpediente.expedienteId, expedienteId))
      .orderBy(asc(pasosExpediente.orden));

    const nextPendiente = nextPasos.find(
      (p) => p.orden > paso.orden && p.estado === "pendiente"
    );

    await db
      .update(expedientes)
      .set({
        pasoActualId: nextPendiente?.id ?? null,
        fechaActualizacion: new Date(),
        ...(nextPendiente
          ? {}
          : { estadoGlobal: "formalizado" as never, fechaFormalizacion: new Date() }),
      })
      .where(eq(expedientes.id, expedienteId));

    // Log activity
    await db.insert(actividad).values({
      expedienteId,
      usuarioId: session.id,
      accion: "cambio_paso",
      descripcion: `Paso "${pasoFlujo?.titulo}" marcado como completado`,
      metadata: { pasoId, pasoOrden: paso.orden },
    });
  }

  return NextResponse.json(updated);
}
