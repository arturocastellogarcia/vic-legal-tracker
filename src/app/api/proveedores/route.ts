import { NextResponse } from "next/server";
import { db, proveedores } from "@/lib/db";
import { eq, asc, isNull } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { hasPermission, type UserRole } from "@/lib/auth/rbac";

export async function GET() {
  const session = await requireSession();

  const allProveedores = await db
    .select()
    .from(proveedores)
    .where(isNull(proveedores.deletedAt))
    .orderBy(asc(proveedores.razonSocial));

  return NextResponse.json(allProveedores);
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!hasPermission(session.role as UserRole, "proveedores:manage")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await request.json();
  const { nif, razonSocial, nombreComercial, email, telefono, direccion } = body;

  if (!nif || !razonSocial) {
    return NextResponse.json(
      { error: "NIF y razón social son obligatorios" },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(proveedores)
    .values({
      nif: nif.trim().toUpperCase(),
      razonSocial: razonSocial.trim(),
      nombreComercial: nombreComercial?.trim() || null,
      email: email?.trim() || null,
      telefono: telefono?.trim() || null,
      direccion: direccion?.trim() || null,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!hasPermission(session.role as UserRole, "proveedores:manage")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const [updated] = await db
    .update(proveedores)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(proveedores.id, id))
    .returning();

  return NextResponse.json(updated);
}
