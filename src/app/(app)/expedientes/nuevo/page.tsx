import { requireSession } from "@/lib/auth/session";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { WizardClient } from "./wizard-client";

export default async function NuevoExpedientePage() {
  const session = await requireSession();

  // Get all active users for the responsable selectors
  const activeUsers = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      role: users.role,
      department: users.department,
    })
    .from(users)
    .where(eq(users.active, true))
    .orderBy(users.fullName);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <WizardClient users={activeUsers} currentUserId={session.id} />
    </div>
  );
}
