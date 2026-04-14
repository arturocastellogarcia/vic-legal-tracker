import { requireSession } from "@/lib/auth/session";
import { BarChart3 } from "lucide-react";

export default async function MetricasPage() {
  await requireSession();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Métricas</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Dashboard de indicadores y alertas de expedientes.
        </p>
      </div>
      <div className="border border-dashed border-border rounded-xl p-16 text-center">
        <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-[14px] font-medium text-muted-foreground">
          Disponible en Sprint 5
        </p>
        <p className="text-[12px] text-muted-foreground/60 mt-1">
          Las métricas se calcularán a partir de los expedientes activos.
        </p>
      </div>
    </div>
  );
}
