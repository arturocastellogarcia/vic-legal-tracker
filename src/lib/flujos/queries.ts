import { db, flujos, pasosFlujo } from "@/lib/db";
import { eq, asc, desc } from "drizzle-orm";

export async function getAllFlujos() {
  return db.select().from(flujos).orderBy(asc(flujos.tipo));
}

export async function getFlujoById(id: string) {
  const [flujo] = await db
    .select()
    .from(flujos)
    .where(eq(flujos.id, id))
    .limit(1);
  return flujo ?? null;
}

export async function getFlujoWithPasos(id: string) {
  const [flujo] = await db
    .select()
    .from(flujos)
    .where(eq(flujos.id, id))
    .limit(1);

  if (!flujo) return null;

  const pasos = await db
    .select()
    .from(pasosFlujo)
    .where(eq(pasosFlujo.flujoId, id))
    .orderBy(asc(pasosFlujo.orden));

  return { ...flujo, pasos };
}

export async function getActiveFlujoByTipo(tipo: string) {
  const [flujo] = await db
    .select()
    .from(flujos)
    .where(eq(flujos.tipo, tipo as never))
    .orderBy(desc(flujos.version))
    .limit(1);

  if (!flujo) return null;

  const pasos = await db
    .select()
    .from(pasosFlujo)
    .where(eq(pasosFlujo.flujoId, flujo.id))
    .orderBy(asc(pasosFlujo.orden));

  return { ...flujo, pasos };
}
