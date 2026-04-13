import { requireRole } from "@/lib/auth/session";
import { db, users } from "@/lib/db";
import { UsersList } from "./users-list";
import { InviteUserDialog } from "./invite-dialog";

export default async function UsuariosPage() {
  await requireRole("admin");

  const allUsers = await db.select().from(users).orderBy(users.fullName);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Gestión de usuarios y roles del equipo.
          </p>
        </div>
        <InviteUserDialog />
      </div>

      <UsersList initialUsers={allUsers} />
    </div>
  );
}
