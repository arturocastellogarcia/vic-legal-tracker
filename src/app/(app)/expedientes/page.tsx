import { requireSession } from "@/lib/auth/session";
import { FileText } from "lucide-react";
import Link from "next/link";

export default async function ExpedientesPage() {
  await requireSession();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expedientes</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Todos los expedientes del sistema.
          </p>
        </div>
        <Link
          href="/expedientes/nuevo"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-vic-blue text-white text-[13px] font-medium hover:bg-vic-blue-dark transition-colors"
        >
          Nuevo expediente
        </Link>
      </div>

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
    </div>
  );
}
