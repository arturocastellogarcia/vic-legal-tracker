"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Send,
  Upload,
  FileText,
  X,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROL_LABELS } from "@/lib/constants";

type DocInfo = {
  id: string;
  nombre: string;
  nombreArchivo: string;
  tamanoBytes: number;
  createdAt: string;
};

export function PasoActions({
  pasoId,
  expedienteId,
  estado,
  requiereDocumento,
  requiereValidacion,
  validadorRol,
  documentos: initialDocs = [],
}: {
  pasoId: string;
  expedienteId: string;
  estado: string;
  requiereDocumento: boolean;
  requiereValidacion: boolean;
  validadorRol: string | null;
  documentos?: DocInfo[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [comentario, setComentario] = useState("");
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [docs, setDocs] = useState<DocInfo[]>(initialDocs);
  const [validacionSolicitada, setValidacionSolicitada] = useState(false);

  async function uploadDoc(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("nombre", file.name);
      formData.append("pasoExpedienteId", pasoId);

      const res = await fetch(`/api/expedientes/${expedienteId}/documentos`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al subir documento");
      }

      const doc = await res.json();
      setDocs((prev) => [...prev, doc]);
      toast.success(`Documento "${file.name}" subido`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  async function sendComment() {
    if (!nuevoComentario.trim()) return;
    setSendingComment(true);
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contenido: nuevoComentario.trim(),
          pasoExpedienteId: pasoId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error");
      }

      setNuevoComentario("");
      toast.success("Comentario añadido");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSendingComment(false);
    }
  }

  async function completarPaso() {
    if (requiereDocumento && docs.length === 0) {
      toast.error("Este paso requiere al menos un documento. Sube el documento antes de completar.");
      return;
    }
    if (requiereValidacion && !validacionSolicitada) {
      toast.error(`Este paso requiere validación de ${ROL_LABELS[validadorRol!]}. Solicita la validación primero.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/expedientes/${expedienteId}/pasos/${pasoId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estado: "completado",
            comentario: comentario.trim() || undefined,
          }),
        }
      );

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

  async function solicitarValidacion() {
    setValidacionSolicitada(true);
    toast.success(
      `Validación solicitada a ${ROL_LABELS[validadorRol!]}. Podrás completar el paso una vez validado.`
    );
    // In a full implementation, this would create a notification for the validator
  }

  if (estado === "completado") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[13px] text-vic-green">
          <CheckCircle2 className="w-4 h-4" />
          Paso completado
        </div>
        {docs.length > 0 && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Documentos
            </div>
            <div className="space-y-1.5">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-2 text-[12px] p-2 rounded-md bg-muted/30"
                >
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="flex-1 truncate">{d.nombre}</span>
                  <span className="text-muted-foreground text-[10px]">
                    {(d.tamanoBytes / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
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
    <div className="space-y-5">
      {/* Document upload */}
      {requiereDocumento && (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Documentos {docs.length === 0 && "(obligatorio)"}
          </div>

          {docs.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-2 text-[12px] p-2 rounded-md bg-vic-green-light/50 border border-green-200/50"
                >
                  <FileText className="w-3.5 h-3.5 text-vic-green" />
                  <span className="flex-1 truncate">{d.nombre}</span>
                  <span className="text-muted-foreground text-[10px]">
                    {(d.tamanoBytes / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadDoc(file);
              e.target.value = "";
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-1.5 text-[12px]"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Subiendo…
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Subir documento
              </>
            )}
          </Button>
        </div>
      )}

      {/* Validation request */}
      {requiereValidacion && validadorRol && (
        <div className="p-3 rounded-lg border border-vic-purple/20 bg-vic-purple-light/30">
          <div className="text-[11px] font-bold uppercase tracking-wider text-vic-purple mb-1.5">
            Requiere validación
          </div>
          {validacionSolicitada ? (
            <div className="flex items-center gap-2 text-[12px] text-vic-purple">
              <CheckCircle2 className="w-4 h-4" />
              Validación solicitada a {ROL_LABELS[validadorRol]}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-[12px] text-foreground/70 flex-1">
                Este paso necesita ser validado por {ROL_LABELS[validadorRol]}{" "}
                antes de poder completarse.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={solicitarValidacion}
                className="gap-1.5 text-[12px] shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                Solicitar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Comment for this step */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Nota del paso (opcional)
        </div>
        <Textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Observaciones sobre este paso..."
          className="min-h-[60px] text-[13px]"
        />
      </div>

      {/* Complete button */}
      <Button
        onClick={completarPaso}
        disabled={loading}
        className="bg-vic-blue hover:bg-vic-blue-dark gap-1.5 text-[13px]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Guardando…
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Marcar completado
          </>
        )}
      </Button>

      {/* Comments section */}
      <div className="pt-4 border-t border-border">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
          Comentarios del paso
        </div>
        <div className="flex gap-2">
          <Input
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            placeholder="Escribe un comentario..."
            className="text-[13px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendComment();
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={sendComment}
            disabled={sendingComment || !nuevoComentario.trim()}
            className="shrink-0"
          >
            {sendingComment ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
