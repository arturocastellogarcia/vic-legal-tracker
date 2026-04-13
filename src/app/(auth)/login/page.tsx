"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { VicLogo } from "@/components/shared/vic-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) throw authError;
      router.push("/inbox");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error de autenticación";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="bg-white border border-border rounded-2xl p-10 shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-6">
          <VicLogo className="text-vic-blue" />
          <span className="text-[15px] font-bold text-vic-blue tracking-tight">
            VIC
          </span>
          <div className="w-px h-4 bg-border mx-0.5" />
          <span className="text-[15px] font-semibold text-foreground tracking-tight">
            Legal Tracker
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Iniciar sesión
        </h1>
        <p className="text-[13px] text-muted-foreground mb-6">
          Acceso restringido al equipo autorizado.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.email@lasnaves.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-vic-red-light text-vic-red text-[13px] border border-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-vic-blue hover:bg-vic-blue-dark"
            disabled={loading}
          >
            {loading ? "Procesando…" : "Entrar"}
          </Button>
        </form>
      </div>

      <p className="text-center text-[11px] text-muted-foreground/60 mt-4">
        València Innovation Capital — Fundación Las Naves
      </p>
    </div>
  );
}
