import { requireRole } from "@/lib/auth/session";
import { getAllFlujos } from "@/lib/flujos/queries";
import { db, pasosFlujo } from "@/lib/db";
import { eq, count } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  TIPO_LABELS,
  TIPO_ICONS,
  TIPO_COLORS,
  ESTADO_VERSION_LABELS,
  ESTADO_VERSION_COLORS,
} from "@/lib/constants";

export default async function FlujosPage() {
  await requireRole("admin", "juridico");

  const allFlujos = await getAllFlujos();

  // Get paso counts for each flujo
  const flujosWithCounts = await Promise.all(
    allFlujos.map(async (flujo) => {
      const [result] = await db
        .select({ count: count() })
        .from(pasosFlujo)
        .where(eq(pasosFlujo.flujoId, flujo.id));
      return { ...flujo, pasosCount: result?.count ?? 0 };
    })
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Flujos de procedimiento
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Plantillas que definen los pasos de cada tipo de expediente. Editables
          por admin y jurídico.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flujosWithCounts.map((flujo) => (
          <Link
            key={flujo.id}
            href={`/flujos/${flujo.id}`}
            className="group border border-border rounded-xl p-5 bg-white hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">
                  {TIPO_ICONS[flujo.tipo] ?? "📄"}
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold group-hover:text-primary transition-colors">
                    {flujo.nombre}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] mt-1",
                      TIPO_COLORS[flujo.tipo]
                    )}
                  >
                    {TIPO_LABELS[flujo.tipo] ?? flujo.tipo}
                  </Badge>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] shrink-0",
                  ESTADO_VERSION_COLORS[flujo.estadoVersion]
                )}
              >
                {ESTADO_VERSION_LABELS[flujo.estadoVersion]}
              </Badge>
            </div>

            <p className="text-[12px] text-muted-foreground line-clamp-2 mb-3">
              {flujo.descripcion}
            </p>

            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span>{flujo.pasosCount} pasos</span>
              <span>v{flujo.version}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
