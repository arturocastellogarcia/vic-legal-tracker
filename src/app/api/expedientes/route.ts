import { NextResponse } from "next/server";
import { db, expedientes, pasosExpediente, flujos, pasosFlujo, actividad } from "@/lib/db";
import { eq, desc, asc, like, sql, and, isNull } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { createExpedienteSchema, checkSARA } from "@/lib/validations/expediente";

async function generateRef(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EXP-${year}-`;

  // Find the latest ref for this year
  const [latest] = await db
    .select({ ref: expedientes.ref })
    .from(expedientes)
    .where(like(expedientes.ref, `${prefix}%`))
    .orderBy(desc(expedientes.ref))
    .limit(1);

  if (!latest) {
    return `${prefix}0001`;
  }

  const lastNum = parseInt(latest.ref.replace(prefix, ""), 10);
  const nextNum = (lastNum + 1).toString().padStart(4, "0");
  return `${prefix}${nextNum}`;
}

export async function GET() {
  const session = await requireSession();

  const allExpedientes = await db
    .select()
    .from(expedientes)
    .where(isNull(expedientes.deletedAt))
    .orderBy(desc(expedientes.fechaCreacion));

  return NextResponse.json(allExpedientes);
}

export async function POST(request: Request) {
  const session = await requireSession();

  const body = await request.json();
  const parsed = createExpedienteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Find active flujo for this tipo
  const [flujo] = await db
    .select()
    .from(flujos)
    .where(
      and(
        eq(flujos.tipo, data.tipo as never),
        eq(flujos.activo, true)
      )
    )
    .orderBy(desc(flujos.version))
    .limit(1);

  if (!flujo) {
    return NextResponse.json(
      { error: `No hay flujo activo para el tipo "${data.tipo}"` },
      { status: 400 }
    );
  }

  // Get flujo steps
  const pasos = await db
    .select()
    .from(pasosFlujo)
    .where(eq(pasosFlujo.flujoId, flujo.id))
    .orderBy(asc(pasosFlujo.orden));

  if (pasos.length === 0) {
    return NextResponse.json(
      { error: "El flujo no tiene pasos definidos" },
      { status: 400 }
    );
  }

  // Generate ref
  const ref = await generateRef();

  // Check SARA
  const esSara = checkSARA(data.subtipo, data.importeEstimado);
  const metadata = {
    ...(data.metadata ?? {}),
    ...(esSara ? { es_sara: true } : {}),
  };

  // Create expediente
  const [expediente] = await db
    .insert(expedientes)
    .values({
      ref,
      titulo: data.titulo,
      descripcion: data.descripcion ?? null,
      tipo: data.tipo as never,
      subtipo: data.subtipo ? (data.subtipo as never) : null,
      importeEstimado: data.importeEstimado?.toString() ?? null,
      prioridad: data.prioridad as never,
      estadoGlobal: "en_curso" as never,
      creadoPor: session.id,
      responsableTecnico: data.responsableTecnico,
      responsableJuridico: data.responsableJuridico ?? null,
      docUrl: data.docUrl || null,
      metadata,
    })
    .returning();

  // Create step instances from flujo
  const stepInstances = pasos.map((paso) => ({
    expedienteId: expediente.id,
    pasoFlujoId: paso.id,
    orden: paso.orden,
    estado: "pendiente" as const,
  }));

  const insertedSteps = await db
    .insert(pasosExpediente)
    .values(stepInstances)
    .returning();

  // Set paso_actual_id to first step
  if (insertedSteps.length > 0) {
    await db
      .update(expedientes)
      .set({
        pasoActualId: insertedSteps[0].id,
        estadoGlobal: "en_curso" as never,
      })
      .where(eq(expedientes.id, expediente.id));
  }

  // Log activity
  await db.insert(actividad).values({
    expedienteId: expediente.id,
    usuarioId: session.id,
    accion: "creacion",
    descripcion: `Expediente ${ref} creado: ${data.titulo}`,
    metadata: { tipo: data.tipo, subtipo: data.subtipo, flujoId: flujo.id },
  });

  return NextResponse.json(
    { ...expediente, ref, pasosCount: insertedSteps.length },
    { status: 201 }
  );
}
