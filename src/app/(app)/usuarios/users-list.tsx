"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ROLE_LABELS,
  ROLE_COLORS,
  type UserRole,
} from "@/lib/auth/rbac";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  department: string | null;
  active: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
};

const ROLES = Object.entries(ROLE_LABELS) as [UserRole, string][];

export function UsersList({ initialUsers }: { initialUsers: User[] }) {
  const [userList, setUserList] = useState(initialUsers);

  async function updateUser(id: string, updates: { role?: string; active?: boolean }) {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar");
      }

      const updated = await res.json();
      setUserList((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updated } : u))
      );
      toast.success("Usuario actualizado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    }
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Usuario
            </th>
            <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Departamento
            </th>
            <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Rol
            </th>
            <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Activo
            </th>
          </tr>
        </thead>
        <tbody>
          {userList.map((user) => {
            const initials = user.fullName
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <tr
                key={user.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-[11px] font-semibold bg-vic-blue-light text-vic-blue">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-[13px] font-medium">
                        {user.fullName}
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-muted-foreground">
                  {user.department ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={user.role}
                    onValueChange={(value: string | null) => {
                      if (value) updateUser(user.id, { role: value });
                    }}
                  >
                    <SelectTrigger className="w-[160px] h-8 text-[12px]">
                      <SelectValue>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            ROLE_COLORS[user.role as UserRole]
                          )}
                        >
                          {ROLE_LABELS[user.role as UserRole] || user.role}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(([key, label]) => (
                        <SelectItem key={key} value={key} className="text-[13px]">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch
                    checked={user.active}
                    onCheckedChange={(checked) =>
                      updateUser(user.id, { active: checked })
                    }
                  />
                </td>
              </tr>
            );
          })}
          {userList.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-12 text-center text-[13px] text-muted-foreground"
              >
                No hay usuarios registrados. Invita al primer usuario.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
