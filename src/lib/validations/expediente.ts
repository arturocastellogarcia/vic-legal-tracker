import { z } from "zod";

export const UMBRALES_CONTRATO_MENOR: Record<string, number> = {
  servicios: 15000,
  suministros: 15000,
  obras: 40000,
  idi: 50000,
};

export const UMBRALES_SARA: Record<string, number> = {
  servicios: 216000,
  suministros: 216000,
  obras: 5404000,
  idi: 216000,
};

export const createExpedienteSchema = z
  .object({
    titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    descripcion: z.string().optional(),
    tipo: z.enum([
      "contrato_menor",
      "licitacion",
      "convenio",
      "softlanding",
      "cesion_espacios",
      "gastos",
    ]),
    subtipo: z
      .enum(["servicios", "suministros", "obras", "idi"])
      .nullable()
      .optional(),
    importeEstimado: z.number().min(0).nullable().optional(),
    prioridad: z.enum(["alta", "media", "normal"]).default("normal"),
    responsableTecnico: z.string().uuid(),
    responsableJuridico: z.string().uuid().nullable().optional(),
    docUrl: z.string().url().nullable().optional().or(z.literal("")),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .refine(
    (data) => {
      // Contrato menor requires subtipo
      if (data.tipo === "contrato_menor" && !data.subtipo) {
        return false;
      }
      return true;
    },
    {
      message:
        "El contrato menor requiere indicar el subtipo (servicios, suministros, obras o I+D+i)",
      path: ["subtipo"],
    }
  )
  .refine(
    (data) => {
      // Validate importe against contrato menor thresholds
      if (
        data.tipo === "contrato_menor" &&
        data.subtipo &&
        data.importeEstimado
      ) {
        const umbral =
          UMBRALES_CONTRATO_MENOR[data.subtipo];
        if (data.importeEstimado >= umbral) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        "El importe supera el umbral de contrato menor. Considera reclasificar como licitación.",
      path: ["importeEstimado"],
    }
  );

export type CreateExpedienteInput = z.infer<typeof createExpedienteSchema>;

export function getUmbralContratoMenor(subtipo: string): number {
  return UMBRALES_CONTRATO_MENOR[subtipo] ?? 15000;
}

export function checkSARA(
  subtipo: string | null | undefined,
  importe: number | null | undefined
): boolean {
  if (!subtipo || !importe) return false;
  const umbral = UMBRALES_SARA[subtipo] ?? 216000;
  return importe >= umbral;
}

export function formatEur(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
