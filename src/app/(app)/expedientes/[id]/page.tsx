import { requireSession } from "@/lib/auth/session";
import { db, expedientes, pasosExpediente, pasosFlujo, users, actividad, documentos, comentarios } from "@/lib/db";
import { eq, asc, desc, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  CircleDot,
  Ban,
  MinusCircle,
  FileText,
  Clock,
  Shield,
  AlertTriangle,
} from "lucide-react";
import {
  TIPO_LABELS,
  TIPO_COLORS,
  ROL_LABELS,
  ROL_COLORS,
} from "@/lib/constants";
import { formatEur } from "@/lib/validations/expediente";
import { PasoActions } from "./paso-actions";

const ESTADO_PASO_ICON: Record<string, React.ReactNode> = {
  completado: <CheckCircle2 className="w-4 h-4 text-vic-green" />,
  en_curso: <CircleDot className="w-4 h-4 text-vic-blue" />,
  pendiente: <Circle className="w-4 h-4 text-muted-foreground/40" />,
  bloqueado: <AlertTriangle className="w-4 h-4 text-vic-red" />,
  omitido: <MinusCircle className="w-4 h-4 text-muted-foreground/30" />,
};

export default async function ExpedienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  // Fetch expediente
  const [exp] = await db
    .select()
    .from(expedientes)
    .where(eq(expedientes.id, id))
    .limit(1);

  if (!exp) notFound();

  // Fetch pasos with their flujo definitions
  const pasos = await db
    .select({
      paso: pasosExpediente,
      flujo: pasosFlujo,
    })
    .from(pasosExpediente)
    .innerJoin(pasosFlujo, eq(pasosExpediente.pasoFlujoId, pasosFlujo.id))
    .where(eq(pasosExpediente.expedienteId, id))
    .orderBy(asc(pasosExpediente.orden));

  // Fetch assigned users
  const [tecnico] = await db
    .select({ fullName: users.fullName })
    .from(users)
    .where(eq(users.id, exp.responsableTecnico))
    .limit(1);

  let juridicoName: string | null = null;
  if (exp.responsableJuridico) {
    const [j] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, exp.responsableJuridico))
      .limit(1);
    juridicoName = j?.fullName ?? null;
  }

  // Fetch documents for the expediente
  const allDocs = await db
    .select()
    .from(documentos)
    .where(
      and(
        eq(documentos.expedienteId, id),
        isNull(documentos.deletedAt)
      )
    )
    .orderBy(asc(documentos.createdAt));

  // Recent activity
  const recentActivity = await db
    .select({
      id: actividad.id,
      accion: actividad.accion,
      descripcion: actividad.descripcion,
      createdAt: actividad.createdAt,
    })
    .from(actividad)
    .where(eq(actividad.expedienteId, id))
    .orderBy(desc(actividad.createdAt))
    .limit(5);

  // Determine current step
  const currentPaso =
    pasos.find((p) => p.paso.id === exp.pasoActualId) ??
    pasos.find((p) => p.paso.estado === "en_curso") ??
    pasos.find((p) => p.paso.estado === "pendiente");

  const completedCount = pasos.filter(
    (p) => p.paso.estado === "completado"
  ).length;
  const progressPct =
    pasos.length > 0 ? Math.round((completedCount / pasos.length) * 100) : 0;

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left sidebar — step list */}
      <div className="w-[260px] border-r border-border bg-white overflow-y-auto shrink-0">
        <div className="p-4 border-b border-border">
          <Link
            href="/expedientes"
            className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Expedientes
          </Link>
          <div className="text-[11px] font-bold text-muted-foreground tracking-wider">
            {exp.ref}
          </div>
          <div className="text-[13px] font-semibold mt-0.5 line-clamp-2">
            {exp.titulo}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Badge
              variant="secondary"
              className={cn("text-[10px]", TIPO_COLORS[exp.tipo])}
            >
              {TIPO_LABELS[exp.tipo]}
            </Badge>
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
              <span>Progreso</span>
              <span>
                {completedCount}/{pasos.length} · {progressPct}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-vic-blue rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step list */}
        <div className="py-2">
          {pasos.map((p) => {
            const isCurrent = p.paso.id === currentPaso?.paso.id;
            return (
              <div
                key={p.paso.id}
                className={cn(
                  "flex items-start gap-2.5 px-4 py-2.5 text-[12px] transition-colors",
                  isCurrent && "bg-vic-blue-light/30"
                )}
              >
                <div className="mt-0.5">
                  {ESTADO_PASO_ICON[p.paso.estado]}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "font-medium leading-tight",
                      p.paso.estado === "completado" && "text-muted-foreground line-through",
                      p.paso.estado === "omitido" && "text-muted-foreground/50"
                    )}
                  >
                    {p.flujo.titulo}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {ROL_LABELS[p.flujo.responsableRol]}
                    {p.flujo.bloqueante && " · Bloqueante"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center — current step detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentPaso ? (
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] text-muted-foreground">
                Paso {currentPaso.flujo.orden} de {pasos.length}
              </span>
              {currentPaso.flujo.bloqueante && (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-vic-red-light text-vic-red"
                >
                  Bloqueante
                </Badge>
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-1">
              {currentPaso.flujo.titulo}
            </h2>
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] mb-4",
                ROL_COLORS[currentPaso.flujo.responsableRol]
              )}
            >
              Responsable: {ROL_LABELS[currentPaso.flujo.responsableRol]}
            </Badge>

            {/* Instructions */}
            <div className="mt-4 prose prose-sm max-w-none">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Instrucciones
              </div>
              <div className="text-[13px] leading-relaxed whitespace-pre-line text-foreground/80">
                {currentPaso.flujo.instrucciones}
              </div>
            </div>

            {/* Legal justification */}
            {currentPaso.flujo.justificacionLegal && (
              <div className="mt-4 p-3 rounded-lg bg-vic-blue-light/30 border border-vic-blue/10">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-vic-blue mb-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Base legal
                </div>
                <div className="text-[12px] text-foreground/70 leading-relaxed">
                  {currentPaso.flujo.justificacionLegal}
                </div>
              </div>
            )}

            {/* Required document */}
            {currentPaso.flujo.requiereDocumento && (
              <div className="mt-4 p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Documento requerido
                </div>
                <div className="text-[13px]">
                  {currentPaso.flujo.documentoRequerido ?? "Documento"}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Subida de documentos disponible en Sprint 4.
                </p>
              </div>
            )}

            {/* Deadline */}
            {currentPaso.flujo.plazoOrientativoDias && (
              <div className="mt-3 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                Plazo orientativo: {currentPaso.flujo.plazoOrientativoDias} días
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-border">
              <PasoActions
                pasoId={currentPaso.paso.id}
                expedienteId={id}
                estado={currentPaso.paso.estado}
                requiereDocumento={currentPaso.flujo.requiereDocumento}
                requiereValidacion={currentPaso.flujo.requiereValidacion}
                validadorRol={currentPaso.flujo.validadorRol}
                documentos={allDocs
                  .filter((d) => d.pasoExpedienteId === currentPaso.paso.id)
                  .map((d) => ({
                    id: d.id,
                    nombre: d.nombre,
                    nombreArchivo: d.nombreArchivo,
                    tamanoBytes: d.tamanoBytes,
                    createdAt: d.createdAt.toISOString(),
                  }))}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <CheckCircle2 className="w-12 h-12 text-vic-green mx-auto mb-3" />
              <h2 className="text-lg font-bold">Todos los pasos completados</h2>
              <p className="text-[13px] text-muted-foreground mt-1">
                El expediente ha completado todo su flujo de tramitación.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right panel — summary */}
      <div className="w-[260px] border-l border-border bg-white overflow-y-auto shrink-0 p-4 space-y-5">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Expediente
          </div>
          <div className="space-y-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ref</span>
              <span className="font-mono font-medium">{exp.ref}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Importe</span>
              <span className="font-medium">
                {formatEur(exp.importeEstimado ? parseFloat(exp.importeEstimado) : null)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prioridad</span>
              <span className="capitalize">{exp.prioridad}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <span className="capitalize">
                {exp.estadoGlobal.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Equipo
          </div>
          <div className="space-y-2 text-[12px]">
            <div>
              <span className="text-muted-foreground block">Técnico</span>
              <span className="font-medium">
                {tecnico?.fullName ?? "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Jurídico</span>
              <span className="font-medium">
                {juridicoName ?? "Sin asignar"}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Actividad reciente
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((a) => (
                <div key={a.id} className="text-[11px]">
                  <div className="text-foreground/80">{a.descripcion}</div>
                  <div className="text-muted-foreground/60">
                    {new Date(a.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground/60">
              Sin actividad registrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
