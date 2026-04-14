import { requireSession } from "@/lib/auth/session";
import { db, plantillas, pasosFlujo, flujos } from "@/lib/db";
import { eq, asc, count } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText, Download } from "lucide-react";
import { TIPO_LABELS, TIPO_COLORS } from "@/lib/constants";

export default async function PlantillasPage() {
  await requireSession();

  const allPlantillas = await db
    .select()
    .from(plantillas)
    .where(eq(plantillas.activa, true))
    .orderBy(asc(plantillas.nombre));

  // Count usage per plantilla
  const usage: Record<string, number> = {};
  for (const p of allPlantillas) {
    const [r] = await db
      .select({ count: count() })
      .from(pasosFlujo)
      .where(eq(pasosFlujo.plantillaId, p.id));
    usage[p.id] = r?.count ?? 0;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Plantillas</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Documentos modelo asociados a los pasos de los procedimientos. Los
          técnicos pueden descargarlos directamente desde cada paso.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allPlantillas.map((p) => (
          <div
            key={p.id}
            className="border border-border rounded-xl p-4 bg-white hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-vic-blue-light flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-vic-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold leading-tight mb-1">
                  {p.nombre}
                </h3>
                {p.descripcion && (
                  <p className="text-[12px] text-muted-foreground line-clamp-2 mb-2">
                    {p.descripcion}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {p.tipoExpediente ? (
                    <Badge
                      variant="secondary"
                      className={cn("text-[10px]", TIPO_COLORS[p.tipoExpediente])}
                    >
                      {TIPO_LABELS[p.tipoExpediente]}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-gray-100 text-gray-500"
                    >
                      Universal
                    </Badge>
                  )}
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    .{p.formato} · v{p.version}
                  </span>
                  {usage[p.id] > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {usage[p.id]} paso{usage[p.id] !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
              <a
                href={`/api/plantillas/${p.id}/download`}
                className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-vic-blue hover:bg-vic-blue-light transition-colors"
                title="Descargar"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {allPlantillas.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-[13px] text-muted-foreground">
            No hay plantillas registradas.
          </p>
        </div>
      )}
    </div>
  );
}
