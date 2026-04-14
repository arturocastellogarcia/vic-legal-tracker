"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { VicLogo } from "./vic-logo";
import { NotificationsBell } from "./notifications-bell";
import {
  Inbox,
  FileText,
  Columns3,
  BarChart3,
  Building2,
  GitBranch,
  FileStack,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
};

const NAV_MAIN: NavItem[] = [
  { label: "Mi trabajo", href: "/inbox", icon: Inbox },
  { label: "Expedientes", href: "/expedientes", icon: FileText },
  { label: "Kanban", href: "/kanban", icon: Columns3 },
  { label: "Métricas", href: "/metricas", icon: BarChart3 },
  { label: "Proveedores", href: "/proveedores", icon: Building2 },
];

const NAV_ADMIN: NavItem[] = [
  {
    label: "Flujos",
    href: "/flujos",
    icon: GitBranch,
    roles: ["admin", "juridico"],
  },
  {
    label: "Plantillas",
    href: "/plantillas",
    icon: FileStack,
    roles: ["admin"],
  },
  {
    label: "Usuarios",
    href: "/usuarios",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Configuración",
    href: "/configuracion",
    icon: Settings,
    roles: ["admin"],
  },
];

type SidebarProps = {
  user: {
    fullName: string;
    email: string;
    role: UserRole;
  };
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const adminItems = NAV_ADMIN.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="flex flex-col w-[220px] border-r border-border bg-white h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 h-14 border-b border-border shrink-0">
        <VicLogo className="text-vic-blue" />
        <span className="text-[13px] font-bold text-vic-blue tracking-tight">
          VIC
        </span>
        <div className="w-px h-4 bg-border mx-1" />
        <span className="text-[13px] font-semibold text-foreground tracking-tight">
          Legal Tracker
        </span>
        <div className="ml-auto">
          <NotificationsBell />
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <div className="space-y-0.5">
          {NAV_MAIN.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/inbox" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-vic-blue text-white"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {adminItems.length > 0 && (
          <>
            <div className="mt-5 mb-2 px-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Administración
              </span>
            </div>
            <div className="space-y-0.5">
              {adminItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-vic-blue text-white"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* User card */}
      <div className="border-t border-border p-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-[11px] font-semibold bg-vic-blue-light text-vic-blue">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium truncate">
              {user.fullName}
            </div>
            <Badge
              variant="secondary"
              className={cn("text-[10px] px-1.5 py-0", ROLE_COLORS[user.role])}
            >
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
