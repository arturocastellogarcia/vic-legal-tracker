/**
 * Seed script: inserts the 6 legal procedure flows into the database.
 * Run with: npx tsx src/lib/flujos/seed.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { flujos, pasosFlujo } from "../db/schema";
import { FLUJOS_SEED } from "./seed-data";
import { eq } from "drizzle-orm";

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set. Create .env.local first.");
    process.exit(1);
  }

  const client = postgres(url, { prepare: false });
  const db = drizzle(client);

  console.log("🌱 Seeding flujos...\n");

  for (const flujoData of FLUJOS_SEED) {
    // Check if flujo already exists for this tipo
    const existing = await db
      .select()
      .from(flujos)
      .where(eq(flujos.tipo, flujoData.tipo as never))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ⏭  ${flujoData.nombre} — already exists, skipping`);
      continue;
    }

    // Insert flujo
    const [flujo] = await db
      .insert(flujos)
      .values({
        tipo: flujoData.tipo as never,
        version: 1,
        nombre: flujoData.nombre,
        descripcion: flujoData.descripcion,
        activo: true,
        estadoVersion: flujoData.estadoVersion as never,
      })
      .returning();

    console.log(
      `  ✓ ${flujoData.nombre} (${flujoData.estadoVersion}) — ${flujoData.pasos.length} pasos`
    );

    // Insert pasos
    for (const paso of flujoData.pasos) {
      await db.insert(pasosFlujo).values({
        flujoId: flujo.id,
        orden: paso.orden,
        titulo: paso.titulo,
        instrucciones: paso.instrucciones,
        justificacionLegal: paso.justificacionLegal ?? null,
        documentoRequerido: paso.documentoRequerido ?? null,
        responsableRol: paso.responsableRol as never,
        validadorRol: (paso.validadorRol as never) ?? null,
        plazoOrientativoDias: paso.plazoOrientativoDias ?? null,
        requiereValidacion: paso.requiereValidacion,
        requiereDocumento: paso.requiereDocumento,
        bloqueante: paso.bloqueante,
        condicionOmision: paso.condicionOmision ?? null,
      });
    }
  }

  console.log("\n✅ Seed complete!");
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
