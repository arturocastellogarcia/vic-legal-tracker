import { requireSession } from "@/lib/auth/session";
import { db, expedientes } from "@/lib/db";
import { isNull, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TIPO_LABELS, TIPO_COLORS } from "@/lib/constants";
import { formatEur } from "@/lib/validations/expediente";
import { Columns3 } from "lucide-react";

const COLUMNS = [
  { key: "borrador", label: "Borrador", color: "bg-gray-400" },
  { key: "en_curso", label: "En curso", color: "bg-vic-blue" },
  { key: "pausado", label: "Pausado", color: "bg-vic-yellow" },
  { key: "formalizado", label: "Formalizado", color: "bg-vic-green" },
  { key: "archivado", label: "Archivado", color: "bg-gray-300" },
];

const PRIORIDAD_BORDER: Record<string, string> = {
  alta: "border-l-vic-red",
  media: "border-l-vic-yellow",
  normal: "border-l-transparent",
};

export default async function KanbanPage() {
  await requireSession();

  const allExpedientes = await db
    .select()
    .from(expedientes)
    .where(isNull(expedientes.deletedAt));

  const byEstado: Record<string, typeof allExpedientes> = {};
  for (const col of COLUMNS) {
    byEstado[col.key] = allExpedientes.filter(
      (e) => e.estadoGlobal === col.key
    );
  }

  const hasAny = allExpedientes.length > 0;

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kanban</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Vista de tablero de expedientes por estado.
          </p>
        </div>
        <Link
          href="/expedientes/nuevo"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-vic-blue text-white text-[13px] font-medium hover:bg-vic-blue-dark transition-colors"
        >
          Nuevo expediente
        </Link>
      </div>

      {!hasAny ? (
        <div className="border border-dashed border-border rounded-xl p-16 text-center">
          <Columns3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-muted-foreground">
            Sin expedientes aún
          </p>
          <Link
            href="/expedientes/nuevo"
            className="inline-flex items-center gap-1 mt-3 text-[13px] font-medium text-vic-blue hover:underline"
          >
            Crear primer expediente →
          </Link>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div key={col.key} className="w-[272px] shrink-0">
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-white border border-border rounded-t-xl">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", col.color)} />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                    {col.label}
                  </span>
                </div>
                <span className="text-[11px] font-semibold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {byEstado[col.key].length}
                </span>
              </div>

              {/* Column body */}
              <div className="bg-muted/40 border border-t-0 border-border rounded-b-xl p-2 min-h-[200px] space-y-2">
                {byEstado[col.key].length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-muted-foreground/50">
                    Sin expedientes
                  </div>
                ) : (
                  byEstado[col.key].map((exp) => (
                    <Link
                      key={exp.id}
                      href={`/expedientes/${exp.id}`}
                      className={cn(
                        "block bg-white rounded-lg border border-border p-3 hover:shadow-md hover:border-primary/20 transition-all border-l-3",
                        PRIORIDAD_BORDER[exp.prioridad] ?? ""
                      )}
                    >
                      <div className="text-[13px] font-semibold leading-tight mb-2 line-clamp-2">
                        {exp.titulo}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2">
                        <span className="font-mono font-bold">{exp.ref}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[9px]",
                            TIPO_COLORS[exp.tipo]
                          )}
                        >
                          {TIPO_LABELS[exp.tipo]}
                        </Badge>
                        {exp.importeEstimado && (
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {formatEur(parseFloat(exp.importeEstimado))}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
