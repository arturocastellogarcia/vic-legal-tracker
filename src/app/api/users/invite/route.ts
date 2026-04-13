import { NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import type { UserRole } from "@/lib/auth/rbac";

export async function POST(request: Request) {
  await requireRole("admin");

  const body = await request.json();
  const { email, fullName, role, department } = body as {
    email: string;
    fullName: string;
    role: UserRole;
    department?: string;
  };

  if (!email || !fullName || !role) {
    return NextResponse.json(
      { error: "email, fullName and role are required" },
      { status: 400 }
    );
  }

  // Create Supabase Auth user with a temporary password
  const supabase = await createAdminClient();
  const tempPassword = crypto.randomUUID().slice(0, 16) + "!Aa1";

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: tempPassword,
      email_confirm: true,
    });

  if (authError) {
    return NextResponse.json(
      { error: authError.message },
      { status: 400 }
    );
  }

  // Create the user profile in our users table
  const [newUser] = await db
    .insert(users)
    .values({
      id: authData.user.id,
      email: email.trim().toLowerCase(),
      fullName,
      role,
      department: department || null,
    })
    .returning();

  return NextResponse.json({
    user: newUser,
    tempPassword,
    message: `Usuario creado. Contraseña temporal: ${tempPassword}`,
  });
}
