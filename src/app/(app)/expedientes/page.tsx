import { requireSession } from "@/lib/auth/session";
import { db, expedientes } from "@/lib/db";
import { desc, isNull } from "drizzle-orm";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TIPO_LABELS, TIPO_COLORS } from "@/lib/constants";
import { formatEur } from "@/lib/validations/expediente";

const ESTADO_COLORS: Record<string, string> = {
  borrador: "bg-gray-100 text-gray-500",
  en_curso: "bg-vic-blue-light text-vic-blue",
  pausado: "bg-vic-yellow-light text-amber-700",
  formalizado: "bg-vic-green-light text-vic-green",
  archivado: "bg-gray-100 text-gray-400",
  cancelado: "bg-vic-red-light text-vic-red",
};

export default async function ExpedientesPage() {
  await requireSession();

  const allExpedientes = await db
    .select()
    .from(expedientes)
    .where(isNull(expedientes.deletedAt))
    .orderBy(desc(expedientes.fechaCreacion));

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expedientes</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {allExpedientes.length} expediente{allExpedientes.length !== 1 ? "s" : ""} en el sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {allExpedientes.length > 0 && (
            <a
              href="/api/expedientes/export"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-white text-[13px] font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Exportar CSV
            </a>
          )}
          <Link
            href="/expedientes/nuevo"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-vic-blue text-white text-[13px] font-medium hover:bg-vic-blue-dark transition-colors"
          >
            Nuevo expediente
          </Link>
        </div>
      </div>

      {allExpedientes.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-16 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-muted-foreground mb-1">
            Sin expedientes aún
          </p>
          <p className="text-[12px] text-muted-foreground/60">
            Crea tu primer expediente con el wizard guiado.
          </p>
          <Link
            href="/expedientes/nuevo"
            className="inline-flex items-center gap-1 mt-4 text-[13px] font-medium text-vic-blue hover:underline"
          >
            Crear expediente →
          </Link>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Ref
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Título
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Tipo
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Importe
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Estado
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {allExpedientes.map((exp) => (
                <tr
                  key={exp.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/expedientes/${exp.id}`}
                      className="text-[12px] font-bold font-mono text-muted-foreground hover:text-primary transition-colors"
                    >
                      {exp.ref}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/expedientes/${exp.id}`}
                      className="text-[13px] font-medium hover:text-primary transition-colors max-w-[300px] truncate block"
                    >
                      {exp.titulo}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={cn("text-[10px]", TIPO_COLORS[exp.tipo])}
                    >
                      {TIPO_LABELS[exp.tipo]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium">
                    {formatEur(exp.importeEstimado ? parseFloat(exp.importeEstimado) : null)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] capitalize",
                        ESTADO_COLORS[exp.estadoGlobal] ?? "bg-gray-100"
                      )}
                    >
                      {exp.estadoGlobal.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">
                    {new Date(exp.fechaCreacion).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
