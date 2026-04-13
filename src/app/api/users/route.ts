import { NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";

export async function GET() {
  await requireRole("admin");

  const allUsers = await db
    .select()
    .from(users)
    .orderBy(users.fullName);

  return NextResponse.json(allUsers);
}

export async function PATCH(request: Request) {
  await requireRole("admin");

  const body = await request.json();
  const { id, role, active } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (role !== undefined) updates.role = role;
  if (active !== undefined) updates.active = active;

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
