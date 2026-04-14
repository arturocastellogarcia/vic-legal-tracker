import { NextResponse } from "next/server";
import { db, documentos, actividad } from "@/lib/db";
import { eq, asc, isNull, and } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ expedienteId: string }> }
) {
  await requireSession();
  const { expedienteId } = await params;

  const docs = await db
    .select()
    .from(documentos)
    .where(
      and(
        eq(documentos.expedienteId, expedienteId),
        isNull(documentos.deletedAt)
      )
    )
    .orderBy(asc(documentos.createdAt));

  return NextResponse.json(docs);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ expedienteId: string }> }
) {
  const session = await requireSession();
  const { expedienteId } = await params;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const nombre = formData.get("nombre") as string | null;
  const pasoExpedienteId = formData.get("pasoExpedienteId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Upload to Supabase Storage
  const supabase = await createClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const storagePath = `${expedienteId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("documentos")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Error al subir: ${uploadError.message}` },
      { status: 500 }
    );
  }

  // Save to DB
  const [doc] = await db
    .insert(documentos)
    .values({
      expedienteId,
      pasoExpedienteId: pasoExpedienteId || null,
      nombre: nombre || file.name,
      nombreArchivo: file.name,
      tipoMime: file.type,
      tamanoBytes: file.size,
      storagePath,
      subidoPor: session.id,
    })
    .returning();

  // Log activity
  await db.insert(actividad).values({
    expedienteId,
    usuarioId: session.id,
    accion: "documento_subido",
    descripcion: `Documento "${nombre || file.name}" subido`,
    metadata: { documentoId: doc.id, pasoExpedienteId },
  });

  return NextResponse.json(doc, { status: 201 });
}
