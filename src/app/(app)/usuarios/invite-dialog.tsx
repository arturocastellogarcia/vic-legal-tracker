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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS, type UserRole } from "@/lib/auth/rbac";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ROLES = Object.entries(ROLE_LABELS) as [UserRole, string][];

export function InviteUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("tecnico");
  const [department, setDepartment] = useState("");
  const [result, setResult] = useState<{
    tempPassword: string;
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim(),
          role,
          department: department.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear usuario");
      }

      setResult({
        tempPassword: data.tempPassword,
        message: data.message,
      });
      toast.success("Usuario creado correctamente");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al crear usuario"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setEmail("");
    setFullName("");
    setRole("tecnico");
    setDepartment("");
    setResult(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-vic-blue text-white text-[13px] font-medium hover:bg-vic-blue-dark transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Invitar usuario
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Invitar nuevo usuario
          </DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-lg bg-vic-green-light border border-green-200">
              <p className="text-[13px] font-medium text-vic-green mb-2">
                Usuario creado correctamente
              </p>
              <p className="text-[12px] text-muted-foreground">
                Comparte la contraseña temporal con el usuario. Deberá cambiarla
                en su primer acceso.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Contraseña temporal
              </Label>
              <Input
                readOnly
                value={result.tempPassword}
                className="font-mono text-[13px] bg-muted"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
            <Button
              onClick={handleClose}
              className="w-full bg-vic-blue hover:bg-vic-blue-dark"
            >
              Cerrar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Nombre completo *
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ana Fernández López"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Email *
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ana.fernandez@lasnaves.com"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Rol *
                </Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger className="text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-[13px]">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Departamento
                </Label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="GovTech"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-vic-blue hover:bg-vic-blue-dark"
            >
              {loading ? "Creando…" : "Crear usuario"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
