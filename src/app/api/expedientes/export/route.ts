import { NextResponse } from "next/server";
import { db, expedientes, users } from "@/lib/db";
import { isNull, eq, desc } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { TIPO_LABELS } from "@/lib/constants";

export async function GET() {
  await requireSession();

  const allExp = await db
    .select()
    .from(expedientes)
    .where(isNull(expedientes.deletedAt))
    .orderBy(desc(expedientes.fechaCreacion));

  // Get user names for responsables
  const userIds = [
    ...new Set(
      allExp.flatMap((e) =>
        [e.responsableTecnico, e.responsableJuridico, e.creadoPor].filter(Boolean)
      )
    ),
  ];
  const userMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const allUsers = await db.select({ id: users.id, fullName: users.fullName }).from(users);
    for (const u of allUsers) {
      userMap[u.id] = u.fullName;
    }
  }

  // Build CSV
  const headers = [
    "Referencia",
    "Título",
    "Tipo",
    "Subtipo",
    "Importe Estimado",
    "Prioridad",
    "Estado",
    "Técnico Responsable",
    "Jurídico Responsable",
    "Creado Por",
    "Fecha Creación",
    "Fecha Formalización",
  ];

  const rows = allExp.map((e) => [
    e.ref,
    `"${(e.titulo ?? "").replace(/"/g, '""')}"`,
    TIPO_LABELS[e.tipo] ?? e.tipo,
    e.subtipo ?? "",
    e.importeEstimado ?? "",
    e.prioridad,
    e.estadoGlobal.replace("_", " "),
    userMap[e.responsableTecnico] ?? "",
    e.responsableJuridico ? (userMap[e.responsableJuridico] ?? "") : "",
    userMap[e.creadoPor] ?? "",
    new Date(e.fechaCreacion).toLocaleDateString("es-ES"),
    e.fechaFormalizacion
      ? new Date(e.fechaFormalizacion).toLocaleDateString("es-ES")
      : "",
  ]);

  const csv =
    "\uFEFF" + // BOM for Excel
    headers.join(";") +
    "\n" +
    rows.map((r) => r.join(";")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="expedientes-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
