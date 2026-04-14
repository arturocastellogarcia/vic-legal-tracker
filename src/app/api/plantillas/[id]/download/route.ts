import { NextResponse } from "next/server";
import { db, plantillas } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireSession();
  const { id } = await params;

  const [plantilla] = await db
    .select()
    .from(plantillas)
    .where(eq(plantillas.id, id))
    .limit(1);

  if (!plantilla) {
    return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
  }

  // Get signed URL from Supabase Storage (valid 60s) and proxy the download
  const supabase = await createAdminClient();
  const { data, error } = await supabase.storage
    .from("plantillas")
    .download(plantilla.storagePath);

  if (error || !data) {
    return NextResponse.json(
      { error: `Error al descargar: ${error?.message}` },
      { status: 500 }
    );
  }

  const arrayBuffer = await data.arrayBuffer();
  const filename = plantilla.storagePath.split("/").pop() ?? "plantilla.docx";

  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
