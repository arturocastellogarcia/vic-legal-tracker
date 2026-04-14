"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, AlertTriangle } from "lucide-react";
import {
  TIPO_LABELS,
  TIPO_ICONS,
  TIPO_COLORS,
} from "@/lib/constants";
import {
  UMBRALES_CONTRATO_MENOR,
  formatEur,
} from "@/lib/validations/expediente";
import { toast } from "sonner";

type WizardUser = {
  id: string;
  fullName: string;
  role: string;
  department: string | null;
};

const TIPOS = [
  {
    value: "contrato_menor",
    label: "Contrato menor",
    desc: "Servicios <15k€, obras <40k€, I+D+i <50k€",
    icon: "📋",
  },
  {
    value: "licitacion",
    label: "Licitación",
    desc: "Procedimiento abierto para importes mayores",
    icon: "📑",
  },
  {
    value: "convenio",
    label: "Convenio",
    desc: "Acuerdo de colaboración con otras entidades",
    icon: "🤝",
  },
  {
    value: "softlanding",
    label: "Softlanding",
    desc: "Acogida de startups internacionales",
    icon: "🚀",
  },
  {
    value: "cesion_espacios",
    label: "Cesión de espacios",
    desc: "Uso temporal de Las Naves o La Harinera",
    icon: "🏛️",
  },
  {
    value: "gastos",
    label: "Gastos",
    desc: "Caja fija, anticipos, dietas, gastos menores",
    icon: "💰",
  },
];

const SUBTIPOS = [
  { value: "servicios", label: "Servicios", umbral: "< 15.000 €" },
  { value: "suministros", label: "Suministros", umbral: "< 15.000 €" },
  { value: "obras", label: "Obras", umbral: "< 40.000 €" },
  { value: "idi", label: "I+D+i", umbral: "< 50.000 €" },
];

const PRIORIDADES = [
  { value: "normal", label: "Normal", color: "bg-gray-100 text-gray-600" },
  { value: "media", label: "Media", color: "bg-vic-yellow-light text-amber-700" },
  { value: "alta", label: "Alta", color: "bg-vic-red-light text-vic-red" },
];

export function WizardClient({
  users,
  currentUserId,
}: {
  users: WizardUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [tipo, setTipo] = useState("");

  // Step 2
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [subtipo, setSubtipo] = useState<string | null>(null);
  const [importe, setImporte] = useState<string>("");
  const [prioridad, setPrioridad] = useState("normal");
  const [responsableTecnico, setResponsableTecnico] = useState(currentUserId);
  const [responsableJuridico, setResponsableJuridico] = useState<string | null>(null);

  const importeNum = parseFloat(importe) || 0;
  const umbral = subtipo ? UMBRALES_CONTRATO_MENOR[subtipo] : null;
  const excedeUmbral =
    tipo === "contrato_menor" && umbral && importeNum >= umbral;

  const tecnicos = users.filter((u) =>
    ["tecnico", "admin", "juridico", "direccion"].includes(u.role)
  );
  const juridicos = users.filter((u) =>
    ["juridico", "admin"].includes(u.role)
  );

  function canAdvanceStep2(): boolean {
    if (!titulo.trim()) return false;
    if (tipo === "contrato_menor" && !subtipo) return false;
    if (excedeUmbral) return false;
    return true;
  }

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch("/api/expedientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || undefined,
          tipo,
          subtipo: tipo === "contrato_menor" ? subtipo : null,
          importeEstimado: importeNum || null,
          prioridad,
          responsableTecnico,
          responsableJuridico: responsableJuridico || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear expediente");
      }

      toast.success(`Expediente ${data.ref} creado`);
      router.push(`/expedientes/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors",
                s < step
                  ? "bg-vic-green text-white"
                  : s === step
                  ? "bg-vic-blue text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {s < step ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
            <span
              className={cn(
                "text-[13px] font-medium",
                s === step ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {s === 1 ? "Tipo" : s === 2 ? "Datos" : "Confirmar"}
            </span>
            {s < 3 && (
              <div className="w-8 h-px bg-border mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Selección de tipo */}
      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Nuevo expediente
          </h1>
          <p className="text-[13px] text-muted-foreground mb-6">
            Selecciona el tipo de procedimiento.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {TIPOS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTipo(t.value)}
                className={cn(
                  "border rounded-xl p-4 text-left transition-all cursor-pointer",
                  tipo === t.value
                    ? "border-vic-blue bg-vic-blue-light/30 shadow-sm"
                    : "border-border bg-white hover:border-border/80 hover:shadow-sm"
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-[14px] font-semibold">{t.label}</span>
                </div>
                <p className="text-[12px] text-muted-foreground">{t.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setStep(2)}
              disabled={!tipo}
              className="bg-vic-blue hover:bg-vic-blue-dark gap-1.5"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Datos del expediente */}
      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Datos del expediente
          </h1>
          <p className="text-[13px] text-muted-foreground mb-6">
            <Badge
              variant="secondary"
              className={cn("text-[10px] mr-1", TIPO_COLORS[tipo])}
            >
              {TIPO_LABELS[tipo]}
            </Badge>
            Completa la información básica.
          </p>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Título del expediente *
              </Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Servicios de limpieza edificios 2026"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Descripción
              </Label>
              <Textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Breve descripción del objeto..."
                className="min-h-[80px]"
              />
            </div>

            {tipo === "contrato_menor" && (
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Subtipo *
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {SUBTIPOS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSubtipo(s.value)}
                      className={cn(
                        "border rounded-lg p-3 text-center transition-all cursor-pointer",
                        subtipo === s.value
                          ? "border-vic-blue bg-vic-blue-light/30"
                          : "border-border bg-white hover:border-border/80"
                      )}
                    >
                      <div className="text-[13px] font-medium">{s.label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {s.umbral}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Importe estimado (€, sin IVA)
                </Label>
                <Input
                  type="number"
                  value={importe}
                  onChange={(e) => setImporte(e.target.value)}
                  placeholder="0"
                  min="0"
                />
                {excedeUmbral && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-vic-red-light text-vic-red text-[12px]">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      El importe {formatEur(importeNum)} supera el límite de
                      contrato menor de {subtipo} ({formatEur(umbral!)}).
                      Reclasifica como licitación.
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Prioridad
                </Label>
                <div className="flex gap-2">
                  {PRIORIDADES.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPrioridad(p.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer border",
                        prioridad === p.value
                          ? cn(p.color, "border-current/20")
                          : "border-border bg-white text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Técnico responsable *
                </Label>
                <Select
                  value={responsableTecnico}
                  onValueChange={(v: string | null) => {
                    if (v) setResponsableTecnico(v);
                  }}
                >
                  <SelectTrigger className="text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tecnicos.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-[13px]">
                        {u.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Jurídico responsable
                </Label>
                <Select
                  value={responsableJuridico ?? "none"}
                  onValueChange={(v: string | null) =>
                    setResponsableJuridico(v === "none" ? null : v)
                  }
                >
                  <SelectTrigger className="text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-[13px]">
                      Sin asignar
                    </SelectItem>
                    {juridicos.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-[13px]">
                        {u.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!canAdvanceStep2()}
              className="bg-vic-blue hover:bg-vic-blue-dark gap-1.5"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmación */}
      {step === 3 && (
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Confirmar expediente
          </h1>
          <p className="text-[13px] text-muted-foreground mb-6">
            Revisa los datos antes de crear el expediente.
          </p>

          <div className="border border-border rounded-xl p-5 bg-white space-y-4">
            <div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
                Título
              </div>
              <div className="text-[15px] font-semibold">{titulo}</div>
            </div>

            {descripcion && (
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
                  Descripción
                </div>
                <div className="text-[13px] text-muted-foreground">
                  {descripcion}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
                  Tipo
                </div>
                <Badge
                  variant="secondary"
                  className={cn("text-[11px]", TIPO_COLORS[tipo])}
                >
                  {TIPO_LABELS[tipo]}
                </Badge>
              </div>
              {subtipo && (
                <div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
                    Subtipo
                  </div>
                  <div className="text-[13px] capitalize">{subtipo}</div>
                </div>
              )}
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
                  Importe
                </div>
                <div className="text-[13px] font-medium">
                  {importeNum ? formatEur(importeNum) : "—"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
                  Técnico
                </div>
                <div className="text-[13px]">
                  {users.find((u) => u.id === responsableTecnico)?.fullName ??
                    "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
                  Jurídico
                </div>
                <div className="text-[13px]">
                  {responsableJuridico
                    ? users.find((u) => u.id === responsableJuridico)
                        ?.fullName ?? "—"
                    : "Sin asignar"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="bg-vic-blue hover:bg-vic-blue-dark gap-1.5"
            >
              {loading ? "Creando…" : "Crear expediente"}
              {!loading && <Check className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
