"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Search } from "lucide-react";
import Link from "next/link";

type Proveedor = {
  id: string;
  nif: string;
  razonSocial: string;
  nombreComercial: string | null;
  email: string | null;
  telefono: string | null;
  activo: boolean;
};

export function ProveedoresList({
  initialProveedores,
}: {
  initialProveedores: Proveedor[];
}) {
  const [search, setSearch] = useState("");

  const filtered = initialProveedores.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.razonSocial.toLowerCase().includes(q) ||
      p.nif.toLowerCase().includes(q) ||
      p.nombreComercial?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por NIF, razón social..."
          className="pl-9 text-[13px]"
        />
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Proveedor
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                NIF
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Contacto
              </th>
              <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/proveedores/${p.id}`}
                    className="flex items-center gap-2.5 hover:text-primary transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">
                        {p.razonSocial}
                      </div>
                      {p.nombreComercial && (
                        <div className="text-[11px] text-muted-foreground">
                          {p.nombreComercial}
                        </div>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-[13px] font-mono text-muted-foreground">
                  {p.nif}
                </td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground">
                  {p.email ?? p.telefono ?? "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant="secondary"
                    className={
                      p.activo
                        ? "bg-vic-green-light text-vic-green text-[10px]"
                        : "bg-gray-100 text-gray-400 text-[10px]"
                    }
                  >
                    {p.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-[13px] text-muted-foreground"
                >
                  {search
                    ? "Sin resultados para esta búsqueda."
                    : "No hay proveedores registrados."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
