import { requireSession } from "@/lib/auth/session";
import { db, proveedores } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default async function ProveedorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const [proveedor] = await db
    .select()
    .from(proveedores)
    .where(eq(proveedores.id, id))
    .limit(1);

  if (!proveedor) notFound();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href="/proveedores"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Proveedores
      </Link>

      <div className="border border-border rounded-xl p-6 bg-white mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <Building2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">
              {proveedor.razonSocial}
            </h1>
            {proveedor.nombreComercial && (
              <p className="text-[13px] text-muted-foreground">
                {proveedor.nombreComercial}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-[11px] font-mono">
                {proveedor.nif}
              </Badge>
              <Badge
                variant="secondary"
                className={
                  proveedor.activo
                    ? "bg-vic-green-light text-vic-green text-[10px]"
                    : "bg-gray-100 text-gray-400 text-[10px]"
                }
              >
                {proveedor.activo ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-[13px]">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {proveedor.email ?? "Sin email"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {proveedor.telefono ?? "Sin teléfono"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {proveedor.direccion ?? "Sin dirección"}
            </span>
          </div>
        </div>
      </div>

      {/* Historial de expedientes — placeholder */}
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
        Historial de expedientes
      </h2>
      <div className="border border-dashed border-border rounded-xl p-10 text-center">
        <p className="text-[13px] text-muted-foreground">
          No hay expedientes vinculados a este proveedor.
        </p>
        <p className="text-[12px] text-muted-foreground/60 mt-1">
          Los expedientes aparecerán aquí cuando se vincule este proveedor.
        </p>
      </div>
    </div>
  );
}
