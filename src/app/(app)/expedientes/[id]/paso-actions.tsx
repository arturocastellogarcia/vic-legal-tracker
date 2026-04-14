"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROL_LABELS } from "@/lib/constants";

export function PasoActions({
  pasoId,
  expedienteId,
  estado,
  requiereDocumento,
  requiereValidacion,
  validadorRol,
}: {
  pasoId: string;
  expedienteId: string;
  estado: string;
  requiereDocumento: boolean;
  requiereValidacion: boolean;
  validadorRol: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [comentario, setComentario] = useState("");

  async function completarPaso() {
    setLoading(true);
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/pasos/${pasoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: "completado",
          comentario: comentario.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar paso");
      }

      toast.success("Paso completado");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  if (estado === "completado") {
    return (
      <div className="flex items-center gap-2 text-[13px] text-vic-green">
        <CheckCircle2 className="w-4 h-4" />
        Paso completado
      </div>
    );
  }

  if (estado === "omitido") {
    return (
      <div className="text-[13px] text-muted-foreground">
        Paso omitido (no aplica a este expediente).
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          Comentario (opcional)
        </label>
        <Textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Notas sobre este paso..."
          className="min-h-[60px] text-[13px]"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={completarPaso}
          disabled={loading}
          className="bg-vic-blue hover:bg-vic-blue-dark gap-1.5 text-[13px]"
        >
          {loading ? (
            "Guardando…"
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Marcar completado
            </>
          )}
        </Button>

        {requiereValidacion && validadorRol && (
          <Button
            variant="outline"
            disabled={loading}
            className="gap-1.5 text-[13px]"
            onClick={() => {
              toast.info(
                `Solicitud de validación a ${ROL_LABELS[validadorRol]} — disponible en Sprint 4`
              );
            }}
          >
            <Send className="w-4 h-4" />
            Solicitar validación ({ROL_LABELS[validadorRol]})
          </Button>
        )}
      </div>
    </div>
  );
}
