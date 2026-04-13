import { createClient } from "@/lib/supabase/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { UserRole } from "./rbac";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string | null;
  avatarUrl: string | null;
};

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser || !dbUser.active) return null;

  return {
    id: dbUser.id,
    email: dbUser.email,
    fullName: dbUser.fullName,
    role: dbUser.role as UserRole,
    department: dbUser.department,
    avatarUrl: dbUser.avatarUrl,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(
  ...allowedRoles: UserRole[]
): Promise<SessionUser> {
  const session = await requireSession();
  if (!allowedRoles.includes(session.role)) {
    redirect("/inbox");
  }
  return session;
}
