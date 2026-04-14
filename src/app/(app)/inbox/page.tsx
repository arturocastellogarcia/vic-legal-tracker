import { requireSession } from "@/lib/auth/session";
import { db, expedientes, pasosExpediente, pasosFlujo, users } from "@/lib/db";
import { eq, asc, and, or, isNull, desc, ne } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Inbox,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  TIPO_LABELS,
  TIPO_COLORS,
  ROL_LABELS,
} from "@/lib/constants";
import type { UserRole } from "@/lib/auth/rbac";

// Map user role to responsable_rol
function getRolResponsable(role: UserRole): string | null {
  const map: Record<string, string> = {
    tecnico: "tecnico",
    juridico: "juridico",
    direccion: "direccion",
    intervencion: "intervencion",
    admin: "tecnico", // admin can act as any, default to tecnico
  };
  return map[role] ?? null;
}

export default async function InboxPage() {
  const session = await requireSession();
  const rolResp = getRolResponsable(session.role as UserRole);

  // 1. Pending for me: steps where I'm the responsible role and are pending/en_curso
  const pendingForMe = rolResp
    ? await db
        .select({
          paso: pasosExpediente,
          flujo: pasosFlujo,
          expediente: expedientes,
        })
        .from(pasosExpediente)
        .innerJoin(pasosFlujo, eq(pasosExpediente.pasoFlujoId, pasosFlujo.id))
        .innerJoin(expedientes, eq(pasosExpediente.expedienteId, expedientes.id))
        .where(
          and(
            eq(pasosFlujo.responsableRol, rolResp as never),
            or(
              eq(pasosExpediente.estado, "pendiente" as never),
              eq(pasosExpediente.estado, "en_curso" as never)
            ),
            eq(expedientes.estadoGlobal, "en_curso" as never),
            isNull(expedientes.deletedAt),
            // Only show steps that are the current step for the expediente
            eq(pasosExpediente.id, expedientes.pasoActualId!)
          )
        )
        .orderBy(asc(pasosExpediente.orden))
        .limit(20)
    : [];

  // 2. Waiting for validation: steps I completed that need someone else's validation
  const waitingValidation = await db
    .select({
      paso: pasosExpediente,
      flujo: pasosFlujo,
      expediente: expedientes,
    })
    .from(pasosExpediente)
    .innerJoin(pasosFlujo, eq(pasosExpediente.pasoFlujoId, pasosFlujo.id))
    .innerJoin(expedientes, eq(pasosExpediente.expedienteId, expedientes.id))
    .where(
      and(
        eq(pasosFlujo.requiereValidacion, true),
        or(
          eq(pasosExpediente.estado, "pendiente" as never),
          eq(pasosExpediente.estado, "en_curso" as never)
        ),
        eq(expedientes.estadoGlobal, "en_curso" as never),
        isNull(expedientes.deletedAt),
        or(
          eq(expedientes.responsableTecnico, session.id),
          eq(expedientes.creadoPor, session.id)
        )
      )
    )
    .orderBy(asc(pasosExpediente.orden))
    .limit(20);

  // 3. My expedientes
  const myExpedientes = await db
    .select()
    .from(expedientes)
    .where(
      and(
        or(
          eq(expedientes.responsableTecnico, session.id),
          eq(expedientes.responsableJuridico!, session.id),
          eq(expedientes.creadoPor, session.id)
        ),
        isNull(expedientes.deletedAt),
        ne(expedientes.estadoGlobal, "archivado" as never)
      )
    )
    .orderBy(desc(expedientes.fechaActualizacion))
    .limit(20);

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

      {/* Pending for me */}
      <section className="mb-8">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Pendiente para mí
          {pendingForMe.length > 0 && (
            <Badge variant="secondary" className="text-[10px] bg-vic-red-light text-vic-red ml-1">
              {pendingForMe.length}
            </Badge>
          )}
        </h2>
        {pendingForMe.length > 0 ? (
          <div className="space-y-2">
            {pendingForMe.map((item) => (
              <Link
                key={item.paso.id}
                href={`/expedientes/${item.expediente.id}`}
                className="flex items-center gap-4 p-3 rounded-xl border border-border bg-white hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-vic-blue-light flex items-center justify-center text-[12px] font-bold text-vic-blue shrink-0">
                  {item.flujo.orden}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium group-hover:text-primary transition-colors">
                    {item.flujo.titulo}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span className="font-mono">{item.expediente.ref}</span>
                    <span className="truncate">{item.expediente.titulo}</span>
                  </div>
                </div>
                <Badge variant="secondary" className={cn("text-[10px] shrink-0", TIPO_COLORS[item.expediente.tipo])}>
                  {TIPO_LABELS[item.expediente.tipo]}
                </Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-xl p-8 text-center">
            <Inbox className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-[13px] text-muted-foreground">
              No tienes pasos pendientes. Todo al día.
            </p>
          </div>
        )}
      </section>

      {/* Waiting for validation */}
      <section className="mb-8">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Esperando validación
          {waitingValidation.length > 0 && (
            <Badge variant="secondary" className="text-[10px] bg-vic-yellow-light text-amber-700 ml-1">
              {waitingValidation.length}
            </Badge>
          )}
        </h2>
        {waitingValidation.length > 0 ? (
          <div className="space-y-2">
            {waitingValidation.map((item) => (
              <Link
                key={item.paso.id}
                href={`/expedientes/${item.expediente.id}`}
                className="flex items-center gap-4 p-3 rounded-xl border border-border bg-white hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-vic-yellow-light flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">
                    {item.flujo.titulo}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    <span className="font-mono">{item.expediente.ref}</span>
                    {" · "}Esperando validación de{" "}
                    {item.flujo.validadorRol
                      ? ROL_LABELS[item.flujo.validadorRol]
                      : "—"}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-xl p-8 text-center">
            <p className="text-[13px] text-muted-foreground">
              No hay pasos esperando validación.
            </p>
          </div>
        )}
      </section>

      {/* My expedientes */}
      <section>
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          Mis expedientes
          {myExpedientes.length > 0 && (
            <span className="text-[10px] text-muted-foreground/60 font-normal">
              ({myExpedientes.length})
            </span>
          )}
        </h2>
        {myExpedientes.length > 0 ? (
          <div className="border border-border rounded-xl overflow-hidden bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ref</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Título</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tipo</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {myExpedientes.map((exp) => (
                  <tr key={exp.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <Link href={`/expedientes/${exp.id}`} className="text-[12px] font-mono font-bold text-muted-foreground hover:text-primary">
                        {exp.ref}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link href={`/expedientes/${exp.id}`} className="text-[13px] font-medium hover:text-primary truncate block max-w-[300px]">
                        {exp.titulo}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="secondary" className={cn("text-[10px]", TIPO_COLORS[exp.tipo])}>
                        {TIPO_LABELS[exp.tipo]}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] capitalize text-muted-foreground">
                      {exp.estadoGlobal.replace("_", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-xl p-8 text-center">
            <p className="text-[13px] text-muted-foreground">
              Aún no tienes expedientes asignados.
            </p>
            <Link href="/expedientes/nuevo" className="inline-flex items-center gap-1 mt-2 text-[13px] font-medium text-vic-blue hover:underline">
              Crear nuevo expediente →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
