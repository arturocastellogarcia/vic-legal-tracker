import { requireSession } from "@/lib/auth/session";
import { db, expedientes, pasosExpediente, pasosFlujo } from "@/lib/db";
import { isNull, eq, and, ne, count, sql } from "drizzle-orm";
import { BarChart3 } from "lucide-react";
import { TIPO_LABELS } from "@/lib/constants";

export default async function MetricasPage() {
  await requireSession();

  const allExp = await db
    .select()
    .from(expedientes)
    .where(isNull(expedientes.deletedAt));

  const activos = allExp.filter((e) => e.estadoGlobal === "en_curso");
  const formalizados = allExp.filter((e) => e.estadoGlobal === "formalizado");
  const pausados = allExp.filter((e) => e.estadoGlobal === "pausado");

  // Steps that have been sitting too long (>30 days in same state)
  const now = Date.now();
  const bloqueados: { ref: string; titulo: string; dias: number; id: string }[] = [];
  for (const exp of activos) {
    const dias = Math.floor(
      (now - new Date(exp.fechaActualizacion).getTime()) / 86400000
    );
    if (dias > 30) {
      bloqueados.push({
        ref: exp.ref,
        titulo: exp.titulo,
        dias,
        id: exp.id,
      });
    }
  }

  // By type
  const byTipo: Record<string, number> = {};
  for (const exp of allExp) {
    byTipo[exp.tipo] = (byTipo[exp.tipo] ?? 0) + 1;
  }
  const tipoEntries = Object.entries(byTipo).sort((a, b) => b[1] - a[1]);
  const maxTipo = Math.max(...tipoEntries.map(([, n]) => n), 1);

  // By estado
  const byEstado: Record<string, number> = {};
  for (const exp of allExp) {
    const label = exp.estadoGlobal.replace("_", " ");
    byEstado[label] = (byEstado[label] ?? 0) + 1;
  }
  const estadoEntries = Object.entries(byEstado);

  // Average days for formalized
  const avgDias =
    formalizados.length > 0
      ? Math.round(
          formalizados.reduce((sum, e) => {
            const created = new Date(e.fechaCreacion).getTime();
            const formal = e.fechaFormalizacion
              ? new Date(e.fechaFormalizacion).getTime()
              : now;
            return sum + (formal - created) / 86400000;
          }, 0) / formalizados.length
        )
      : null;

  // Total importe
  const totalImporte = allExp.reduce((sum, e) => {
    return sum + (e.importeEstimado ? parseFloat(e.importeEstimado) : 0);
  }, 0);

  const hasData = allExp.length > 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Métricas</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Dashboard de indicadores y alertas.
        </p>
      </div>

      {!hasData ? (
        <div className="border border-dashed border-border rounded-xl p-16 text-center">
          <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-muted-foreground">
            Sin datos todavía
          </p>
          <p className="text-[12px] text-muted-foreground/60 mt-1">
            Las métricas se calcularán cuando haya expedientes.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="border border-border rounded-xl p-5 bg-white">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                Expedientes activos
              </div>
              <div className="text-3xl font-bold text-vic-blue">
                {activos.length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                {allExp.length} en total
              </div>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                Formalizados
              </div>
              <div className="text-3xl font-bold text-vic-green">
                {formalizados.length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                {pausados.length} pausados
              </div>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                Media días tramitación
              </div>
              <div
                className={`text-3xl font-bold ${
                  avgDias && avgDias > 60
                    ? "text-vic-red"
                    : "text-vic-green"
                }`}
              >
                {avgDias !== null ? `${avgDias}d` : "—"}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                Sobre {formalizados.length} formalizado
                {formalizados.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                Alertas de bloqueo
              </div>
              <div
                className={`text-3xl font-bold ${
                  bloqueados.length > 0 ? "text-vic-red" : "text-vic-green"
                }`}
              >
                {bloqueados.length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                +30 días en misma etapa
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* By tipo */}
            <div className="border border-border rounded-xl p-5 bg-white">
              <h3 className="text-[13px] font-semibold mb-4">
                Por tipo de procedimiento
              </h3>
              <div className="space-y-3">
                {tipoEntries.map(([tipo, n]) => (
                  <div key={tipo} className="flex items-center gap-3">
                    <div className="w-[130px] text-[11px] text-muted-foreground truncate shrink-0">
                      {TIPO_LABELS[tipo] ?? tipo}
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-vic-blue rounded-full transition-all"
                        style={{
                          width: `${Math.round((n / maxTipo) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-[12px] font-semibold w-8 text-right shrink-0">
                      {n}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By estado */}
            <div className="border border-border rounded-xl p-5 bg-white">
              <h3 className="text-[13px] font-semibold mb-4">
                Por estado
              </h3>
              <div className="space-y-3">
                {estadoEntries.map(([estado, n]) => (
                  <div key={estado} className="flex items-center gap-3">
                    <div className="w-[130px] text-[11px] text-muted-foreground truncate shrink-0 capitalize">
                      {estado}
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-vic-green rounded-full transition-all"
                        style={{
                          width: `${Math.round(
                            (n / Math.max(...Object.values(byEstado), 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-[12px] font-semibold w-8 text-right shrink-0">
                      {n}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Blocked expedientes */}
          {bloqueados.length > 0 && (
            <div className="border border-border rounded-xl p-5 bg-white">
              <h3 className="text-[13px] font-semibold mb-3">
                Expedientes bloqueados (+30 días)
              </h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-2">
                      Expediente
                    </th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-2">
                      Días
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bloqueados.map((b) => (
                    <tr key={b.id} className="border-b border-border last:border-b-0">
                      <td className="py-2">
                        <a
                          href={`/expedientes/${b.id}`}
                          className="text-[13px] hover:text-primary"
                        >
                          <span className="font-mono text-[11px] text-muted-foreground mr-2">
                            {b.ref}
                          </span>
                          {b.titulo.length > 50
                            ? b.titulo.substring(0, 50) + "…"
                            : b.titulo}
                        </a>
                      </td>
                      <td className="py-2 text-right">
                        <span className="text-[12px] font-bold text-vic-red">
                          {b.dias}d
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Total importe */}
          {totalImporte > 0 && (
            <div className="mt-4 text-[12px] text-muted-foreground text-right">
              Importe total estimado en expedientes:{" "}
              <span className="font-semibold text-foreground">
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(totalImporte)}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
