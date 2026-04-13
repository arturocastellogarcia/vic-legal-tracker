import { requireSession } from "@/lib/auth/session";
import { Inbox } from "lucide-react";

export default async function InboxPage() {
  const session = await requireSession();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Hola, {session.fullName.split(" ")[0]}
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Tu bandeja de trabajo — expedientes y pasos que requieren tu atención.
        </p>
      </div>

      {/* Pendiente para mí */}
      <section className="mb-8">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Pendiente para mí
        </h2>
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <Inbox className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-[13px] text-muted-foreground">
            No tienes pasos pendientes. ¡Todo al día!
          </p>
        </div>
      </section>

      {/* Esperando validación */}
      <section className="mb-8">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Esperando validación
        </h2>
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-[13px] text-muted-foreground">
            No hay pasos esperando validación.
          </p>
        </div>
      </section>

      {/* Mis expedientes */}
      <section>
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Mis expedientes
        </h2>
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-[13px] text-muted-foreground">
            Aún no tienes expedientes asignados.
          </p>
          <a
            href="/expedientes/nuevo"
            className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-medium text-vic-blue hover:underline"
          >
            Crear nuevo expediente →
          </a>
        </div>
      </section>
    </div>
  );
}
