import { requireSession } from "@/lib/auth/session";
import { db, proveedores } from "@/lib/db";
import { asc, isNull } from "drizzle-orm";
import { ProveedoresList } from "./proveedores-list";
import { NuevoProveedorDialog } from "./nuevo-dialog";
import { hasPermission, type UserRole } from "@/lib/auth/rbac";

export default async function ProveedoresPage() {
  const session = await requireSession();

  const allProveedores = await db
    .select()
    .from(proveedores)
    .where(isNull(proveedores.deletedAt))
    .orderBy(asc(proveedores.razonSocial));

  const canManage = hasPermission(session.role as UserRole, "proveedores:manage");

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Directorio de proveedores y contrapartes vinculados a expedientes.
          </p>
        </div>
        {canManage && <NuevoProveedorDialog />}
      </div>

      <ProveedoresList initialProveedores={allProveedores} />
    </div>
  );
}
