export type UserRole =
  | "admin"
  | "juridico"
  | "tecnico"
  | "direccion"
  | "intervencion"
  | "solo_lectura";

export type Permission =
  | "expedientes:create"
  | "expedientes:read"
  | "expedientes:read_all"
  | "expedientes:update"
  | "expedientes:delete"
  | "pasos:complete"
  | "pasos:validate"
  | "flujos:read"
  | "flujos:manage"
  | "usuarios:manage"
  | "proveedores:read"
  | "proveedores:manage"
  | "plantillas:manage"
  | "exportar";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "expedientes:create",
    "expedientes:read",
    "expedientes:read_all",
    "expedientes:update",
    "expedientes:delete",
    "pasos:complete",
    "pasos:validate",
    "flujos:read",
    "flujos:manage",
    "usuarios:manage",
    "proveedores:read",
    "proveedores:manage",
    "plantillas:manage",
    "exportar",
  ],
  direccion: [
    "expedientes:read",
    "expedientes:read_all",
    "expedientes:update",
    "pasos:complete",
    "pasos:validate",
    "flujos:read",
    "proveedores:read",
    "exportar",
  ],
  juridico: [
    "expedientes:create",
    "expedientes:read",
    "expedientes:read_all",
    "expedientes:update",
    "pasos:complete",
    "pasos:validate",
    "flujos:read",
    "flujos:manage",
    "proveedores:read",
    "proveedores:manage",
    "exportar",
  ],
  intervencion: [
    "expedientes:read",
    "expedientes:read_all",
    "pasos:complete",
    "pasos:validate",
    "flujos:read",
    "proveedores:read",
    "exportar",
  ],
  tecnico: [
    "expedientes:create",
    "expedientes:read",
    "expedientes:update",
    "pasos:complete",
    "flujos:read",
    "proveedores:read",
    "exportar",
  ],
  solo_lectura: [
    "expedientes:read",
    "expedientes:read_all",
    "flujos:read",
    "proveedores:read",
    "exportar",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  juridico: "Jurídico",
  tecnico: "Técnico",
  direccion: "Dirección",
  intervencion: "Intervención",
  solo_lectura: "Solo lectura",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-vic-purple-light text-vic-purple",
  juridico: "bg-vic-blue-light text-vic-blue",
  tecnico: "bg-vic-green-light text-vic-green",
  direccion: "bg-amber-50 text-amber-700",
  intervencion: "bg-vic-red-light text-vic-red",
  solo_lectura: "bg-gray-100 text-gray-500",
};
