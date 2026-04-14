import { NextResponse } from "next/server";
import {
  db,
  expedientes,
  pasosExpediente,
  pasosFlujo,
  users,
  actividad,
  documentos,
  comentarios,
} from "@/lib/db";
import { eq, asc, desc, and, isNull } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { TIPO_LABELS, ROL_LABELS } from "@/lib/constants";

/**
 * Generates a printable HTML report for an expediente.
 * Opens in a new tab — the user can print to PDF from the browser.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ expedienteId: string }> }
) {
  await requireSession();
  const { expedienteId } = await params;

  const [exp] = await db
    .select()
    .from(expedientes)
    .where(eq(expedientes.id, expedienteId))
    .limit(1);

  if (!exp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Pasos
  const pasos = await db
    .select({ paso: pasosExpediente, flujo: pasosFlujo })
    .from(pasosExpediente)
    .innerJoin(pasosFlujo, eq(pasosExpediente.pasoFlujoId, pasosFlujo.id))
    .where(eq(pasosExpediente.expedienteId, expedienteId))
    .orderBy(asc(pasosExpediente.orden));

  // Users
  const allUsers = await db
    .select({ id: users.id, fullName: users.fullName })
    .from(users);
  const userMap: Record<string, string> = {};
  for (const u of allUsers) userMap[u.id] = u.fullName;

  // Activity log
  const logs = await db
    .select()
    .from(actividad)
    .where(eq(actividad.expedienteId, expedienteId))
    .orderBy(asc(actividad.createdAt));

  // Documents
  const docs = await db
    .select()
    .from(documentos)
    .where(
      and(eq(documentos.expedienteId, expedienteId), isNull(documentos.deletedAt))
    )
    .orderBy(asc(documentos.createdAt));

  // Comments
  const comms = await db
    .select()
    .from(comentarios)
    .where(
      and(eq(comentarios.expedienteId, expedienteId), isNull(comentarios.deletedAt))
    )
    .orderBy(asc(comentarios.createdAt));

  const fDate = (d: Date | null) =>
    d
      ? new Date(d).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const estadoLabel: Record<string, string> = {
    completado: "Completado",
    en_curso: "En curso",
    pendiente: "Pendiente",
    bloqueado: "Bloqueado",
    omitido: "Omitido",
  };

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${exp.ref} — ${exp.titulo}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Space Grotesk', sans-serif; font-size: 12px; color: #1d1d1f; padding: 40px; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 24px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
  .ref { font-size: 11px; font-weight: 700; color: #6b7280; letter-spacing: 0.3px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin: 12px 0; }
  .meta-item label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; color: #9ca3af; display: block; }
  .meta-item span { font-size: 12px; font-weight: 500; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; }
  .b-blue { background: #e8ebff; color: #0524ff; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { text-align: left; padding: 6px 8px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; color: #6b7280; }
  td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  .ok { color: #00b341; }
  .pend { color: #6b7280; }
  .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="ref">${exp.ref}</div>
<h1>${exp.titulo}</h1>
${exp.descripcion ? `<p style="color:#6b7280;margin:6px 0">${exp.descripcion}</p>` : ""}

<div class="meta">
  <div class="meta-item"><label>Tipo</label><span>${TIPO_LABELS[exp.tipo]}</span></div>
  <div class="meta-item"><label>Subtipo</label><span>${exp.subtipo ?? "—"}</span></div>
  <div class="meta-item"><label>Importe</label><span>${exp.importeEstimado ? parseFloat(exp.importeEstimado).toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }) : "—"}</span></div>
  <div class="meta-item"><label>Prioridad</label><span style="text-transform:capitalize">${exp.prioridad}</span></div>
  <div class="meta-item"><label>Estado</label><span style="text-transform:capitalize">${exp.estadoGlobal.replace("_", " ")}</span></div>
  <div class="meta-item"><label>Creación</label><span>${fDate(exp.fechaCreacion)}</span></div>
  <div class="meta-item"><label>Técnico</label><span>${userMap[exp.responsableTecnico] ?? "—"}</span></div>
  <div class="meta-item"><label>Jurídico</label><span>${exp.responsableJuridico ? (userMap[exp.responsableJuridico] ?? "—") : "Sin asignar"}</span></div>
  <div class="meta-item"><label>Creado por</label><span>${userMap[exp.creadoPor] ?? "—"}</span></div>
</div>

<h2>Pasos del procedimiento (${pasos.length})</h2>
<table>
<thead><tr><th>#</th><th>Paso</th><th>Responsable</th><th>Estado</th><th>Completado</th><th>Por</th></tr></thead>
<tbody>
${pasos
  .map(
    (p) => `<tr>
  <td>${p.paso.orden}</td>
  <td><strong>${p.flujo.titulo}</strong>${p.flujo.bloqueante ? ' <span style="color:#e30613;font-size:9px">BLOQ</span>' : ""}</td>
  <td>${ROL_LABELS[p.flujo.responsableRol] ?? p.flujo.responsableRol}</td>
  <td class="${p.paso.estado === "completado" ? "ok" : "pend"}">${estadoLabel[p.paso.estado] ?? p.paso.estado}</td>
  <td>${p.paso.completadoEn ? fDate(p.paso.completadoEn) : "—"}</td>
  <td>${p.paso.completadoPor ? (userMap[p.paso.completadoPor] ?? "—") : "—"}</td>
</tr>${p.paso.comentario ? `<tr><td></td><td colspan="5" style="color:#6b7280;font-style:italic">Nota: ${p.paso.comentario}</td></tr>` : ""}`
  )
  .join("\n")}
</tbody>
</table>

${
  docs.length > 0
    ? `<h2>Documentos (${docs.length})</h2>
<table>
<thead><tr><th>Nombre</th><th>Archivo</th><th>Tamaño</th><th>Subido por</th><th>Fecha</th></tr></thead>
<tbody>
${docs
  .map(
    (d) =>
      `<tr><td>${d.nombre}</td><td>${d.nombreArchivo}</td><td>${(d.tamanoBytes / 1024).toFixed(0)} KB</td><td>${userMap[d.subidoPor] ?? "—"}</td><td>${fDate(d.createdAt)}</td></tr>`
  )
  .join("\n")}
</tbody>
</table>`
    : ""
}

${
  comms.length > 0
    ? `<h2>Comentarios (${comms.length})</h2>
<table>
<thead><tr><th>Autor</th><th>Comentario</th><th>Fecha</th></tr></thead>
<tbody>
${comms
  .map(
    (c) =>
      `<tr><td>${userMap[c.usuarioId] ?? "—"}</td><td>${c.contenido}</td><td>${fDate(c.createdAt)}</td></tr>`
  )
  .join("\n")}
</tbody>
</table>`
    : ""
}

<h2>Registro de actividad (${logs.length})</h2>
<table>
<thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Descripción</th></tr></thead>
<tbody>
${logs
  .map(
    (l) =>
      `<tr><td style="white-space:nowrap">${fDate(l.createdAt)}</td><td>${userMap[l.usuarioId] ?? "—"}</td><td>${l.accion}</td><td>${l.descripcion}</td></tr>`
  )
  .join("\n")}
</tbody>
</table>

<div class="footer">
  VIC Legal Tracker — Informe generado el ${fDate(new Date())} — València Innovation Capital · Fundación Las Naves
</div>

<script>window.onload=function(){window.print()}</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
