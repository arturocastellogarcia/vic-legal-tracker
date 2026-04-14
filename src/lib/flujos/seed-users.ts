/**
 * Seed script: creates 5 test users (one per role) + 3 sample expedientes.
 * Run with: npx tsx src/lib/flujos/seed-users.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, expedientes, pasosExpediente, pasosFlujo, flujos, actividad } from "../db/schema";
import { eq, asc, and } from "drizzle-orm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  const client = postgres(process.env.DATABASE_URL!, { prepare: false });
  const db = drizzle(client);

  const TEST_USERS = [
    { email: "juridico@lasnaves.com", fullName: "Elena Martínez", role: "juridico", department: "Jurídico", password: "Lasnaves1939&" },
    { email: "tecnico@lasnaves.com", fullName: "Luis Pérez", role: "tecnico", department: "GovTech", password: "Lasnaves1939&" },
    { email: "direccion@lasnaves.com", fullName: "María García", role: "direccion", department: "Dirección", password: "Lasnaves1939&" },
    { email: "intervencion@lasnaves.com", fullName: "Carlos Ruiz", role: "intervencion", department: "Intervención", password: "Lasnaves1939&" },
  ];

  console.log("👥 Creating test users...\n");

  const createdUsers: Record<string, string> = {};

  for (const u of TEST_USERS) {
    // Check if already exists
    const [existing] = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
    if (existing) {
      console.log(`  ⏭  ${u.fullName} (${u.role}) — already exists`);
      createdUsers[u.role] = existing.id;
      continue;
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });

    if (authError) {
      console.error(`  ✗ ${u.email}: ${authError.message}`);
      continue;
    }

    await db.insert(users).values({
      id: authData.user.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role as never,
      department: u.department,
    });

    createdUsers[u.role] = authData.user.id;
    console.log(`  ✓ ${u.fullName} (${u.role}) — ${u.email}`);
  }

  // Get admin user
  const [admin] = await db.select().from(users).where(eq(users.role, "admin" as never)).limit(1);
  if (admin) createdUsers["admin"] = admin.id;

  // Create 3 sample expedientes
  console.log("\n📁 Creating sample expedientes...\n");

  const tecnicoId = createdUsers["tecnico"] || createdUsers["admin"];
  const juridicoId = createdUsers["juridico"];

  if (!tecnicoId) {
    console.log("  No tecnico user found, skipping expedientes");
    await client.end();
    process.exit(0);
  }

  const SAMPLES = [
    {
      ref: "EXP-2026-0001",
      titulo: "Servicios de limpieza edificios Las Naves 2026",
      descripcion: "Contratación del servicio integral de limpieza para el ejercicio 2026.",
      tipo: "contrato_menor",
      subtipo: "servicios",
      importe: "12500",
      prioridad: "alta",
    },
    {
      ref: "EXP-2026-0002",
      titulo: "Convenio marco Startup Valencia 2026",
      descripcion: "Acuerdo de colaboración para programas de emprendimiento.",
      tipo: "convenio",
      subtipo: null,
      importe: null,
      prioridad: "normal",
    },
    {
      ref: "EXP-2026-0003",
      titulo: "Equipamiento Lab GovTech",
      descripcion: "Compra de hardware para el laboratorio de innovación.",
      tipo: "contrato_menor",
      subtipo: "suministros",
      importe: "3200",
      prioridad: "media",
    },
  ];

  for (const s of SAMPLES) {
    // Check if exists
    const [existing] = await db.select().from(expedientes).where(eq(expedientes.ref, s.ref)).limit(1);
    if (existing) {
      console.log(`  ⏭  ${s.ref} — already exists`);
      continue;
    }

    // Find flujo
    const [flujo] = await db
      .select()
      .from(flujos)
      .where(and(eq(flujos.tipo, s.tipo as never), eq(flujos.activo, true)))
      .limit(1);

    if (!flujo) {
      console.log(`  ✗ ${s.ref} — no flujo for tipo "${s.tipo}"`);
      continue;
    }

    const pasos = await db
      .select()
      .from(pasosFlujo)
      .where(eq(pasosFlujo.flujoId, flujo.id))
      .orderBy(asc(pasosFlujo.orden));

    // Create expediente
    const [exp] = await db.insert(expedientes).values({
      ref: s.ref,
      titulo: s.titulo,
      descripcion: s.descripcion,
      tipo: s.tipo as never,
      subtipo: s.subtipo ? (s.subtipo as never) : null,
      importeEstimado: s.importe,
      prioridad: s.prioridad as never,
      estadoGlobal: "en_curso" as never,
      creadoPor: tecnicoId,
      responsableTecnico: tecnicoId,
      responsableJuridico: juridicoId || null,
    }).returning();

    // Create step instances
    const stepInstances = pasos.map((p) => ({
      expedienteId: exp.id,
      pasoFlujoId: p.id,
      orden: p.orden,
      estado: "pendiente" as const,
    }));

    const inserted = await db.insert(pasosExpediente).values(stepInstances).returning();

    // Set first step as current
    await db.update(expedientes).set({ pasoActualId: inserted[0].id }).where(eq(expedientes.id, exp.id));

    // Log creation
    await db.insert(actividad).values({
      expedienteId: exp.id,
      usuarioId: tecnicoId,
      accion: "creacion",
      descripcion: `Expediente ${s.ref} creado: ${s.titulo}`,
    });

    console.log(`  ✓ ${s.ref} — ${s.titulo} (${pasos.length} pasos)`);
  }

  console.log("\n✅ Seed complete!");
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
