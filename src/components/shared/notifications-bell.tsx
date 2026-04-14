"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Notification = {
  id: string;
  tipo: string;
  mensaje: string;
  url: string;
  leida: boolean;
  createdAt: string;
};

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/notificaciones")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setNotifications(data))
      .catch(() => {});
  }, [open]);

  const unread = notifications.filter((n) => !n.leida).length;

  async function markRead(id: string) {
    await fetch("/api/notificaciones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, leida: true }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="relative p-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer">
        <Bell className="w-4 h-4 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-vic-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="end">
        <div className="px-3 py-2.5 border-b border-border">
          <span className="text-[13px] font-semibold">Notificaciones</span>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-muted-foreground">
              Sin notificaciones
            </div>
          ) : (
            notifications.slice(0, 15).map((n) => (
              <a
                key={n.id}
                href={n.url}
                onClick={() => markRead(n.id)}
                className={`block px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors ${
                  !n.leida ? "bg-vic-blue-light/20" : ""
                }`}
              >
                <div className="text-[12px] leading-tight">{n.mensaje}</div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </a>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
