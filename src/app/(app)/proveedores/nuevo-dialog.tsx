"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function NuevoProveedorDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      nif: form.get("nif") as string,
      razonSocial: form.get("razonSocial") as string,
      nombreComercial: form.get("nombreComercial") as string,
      email: form.get("email") as string,
      telefono: form.get("telefono") as string,
      direccion: form.get("direccion") as string,
    };

    try {
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear proveedor");
      }

      toast.success("Proveedor creado");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-vic-blue text-white text-[13px] font-medium hover:bg-vic-blue-dark transition-colors cursor-pointer">
        <Plus className="w-4 h-4" />
        Nuevo proveedor
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo proveedor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                NIF *
              </Label>
              <Input name="nif" placeholder="B12345678" required className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Teléfono
              </Label>
              <Input name="telefono" placeholder="+34 600 000 000" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Razón social *
            </Label>
            <Input name="razonSocial" placeholder="Empresa Ejemplo S.L." required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Nombre comercial
            </Label>
            <Input name="nombreComercial" placeholder="Marca comercial (opcional)" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Email
            </Label>
            <Input name="email" type="email" placeholder="contacto@empresa.com" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Dirección
            </Label>
            <Textarea name="direccion" placeholder="Dirección completa" className="min-h-[60px]" />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-vic-blue hover:bg-vic-blue-dark"
          >
            {loading ? "Creando…" : "Crear proveedor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
