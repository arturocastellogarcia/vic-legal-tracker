import { requireRole } from "@/lib/auth/session";
import { getFlujoWithPasos } from "@/lib/flujos/queries";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, FileText, Clock, Shield, CheckCircle2 } from "lucide-react";
import {
  TIPO_LABELS,
  TIPO_COLORS,
  ESTADO_VERSION_LABELS,
  ESTADO_VERSION_COLORS,
  ROL_LABELS,
  ROL_COLORS,
} from "@/lib/constants";

export default async function FlujoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin", "juridico");
  const { id } = await params;

  const flujo = await getFlujoWithPasos(id);
  if (!flujo) notFound();

  const bloqueantes = flujo.pasos.filter((p) => p.bloqueante).length;
  const conDoc = flujo.pasos.filter((p) => p.requiereDocumento).length;
  const conValidacion = flujo.pasos.filter((p) => p.requiereValidacion).length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back + Header */}
      <Link
        href="/flujos"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Flujos
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{flujo.nombre}</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {flujo.descripcion}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="secondary"
              className={cn("text-[10px]", TIPO_COLORS[flujo.tipo])}
            >
              {TIPO_LABELS[flujo.tipo]}
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px]",
                ESTADO_VERSION_COLORS[flujo.estadoVersion]
              )}
            >
              {ESTADO_VERSION_LABELS[flujo.estadoVersion]}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              v{flujo.version}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <div className="border border-border rounded-lg p-3 bg-white">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
            Total pasos
          </div>
          <div className="text-2xl font-bold mt-1">{flujo.pasos.length}</div>
        </div>
        <div className="border border-border rounded-lg p-3 bg-white">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
            Bloqueantes
          </div>
          <div className="text-2xl font-bold mt-1 text-vic-red">
            {bloqueantes}
          </div>
        </div>
        <div className="border border-border rounded-lg p-3 bg-white">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
            Requieren doc
          </div>
          <div className="text-2xl font-bold mt-1 text-vic-blue">{conDoc}</div>
        </div>
        <div className="border border-border rounded-lg p-3 bg-white">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
            Con validación
          </div>
          <div className="text-2xl font-bold mt-1 text-vic-purple">
            {conValidacion}
          </div>
        </div>
      </div>

      {/* Steps list */}
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
        Pasos del procedimiento
      </h2>

      <div className="space-y-3">
        {flujo.pasos.map((paso, i) => (
          <div
            key={paso.id}
            className="border border-border rounded-xl p-4 bg-white hover:border-border/80 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Step number */}
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
                {paso.orden}
              </div>

              <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h3 className="text-[14px] font-semibold">{paso.titulo}</h3>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px]",
                      ROL_COLORS[paso.responsableRol]
                    )}
                  >
                    {ROL_LABELS[paso.responsableRol]}
                  </Badge>
                  {paso.bloqueante && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-vic-red-light text-vic-red"
                    >
                      Bloqueante
                    </Badge>
                  )}
                  {paso.condicionOmision && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-gray-100 text-gray-500"
                    >
                      Condicional
                    </Badge>
                  )}
                </div>

                {/* Instructions preview */}
                <p className="text-[12px] text-muted-foreground line-clamp-2 mb-2">
                  {paso.instrucciones.replace(/[*#\n]/g, " ").trim()}
                </p>

                {/* Meta tags */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  {paso.requiereDocumento && (
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {paso.documentoRequerido ?? "Documento requerido"}
                    </span>
                  )}
                  {paso.plazoOrientativoDias && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {paso.plazoOrientativoDias} días
                    </span>
                  )}
                  {paso.requiereValidacion && paso.validadorRol && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Valida: {ROL_LABELS[paso.validadorRol]}
                    </span>
                  )}
                  {paso.justificacionLegal && (
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Base legal
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
