"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { cn } from "@/lib/utils";

export function UserAccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  if (!user) return null;

  const initials =
    user.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "MB";

  const handleLogout = async () => {
    setLoggingOut(true);
    setOpen(false);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5 sm:px-3 shadow-sm transition-colors hover:bg-muted",
          open && "ring-2 ring-sky-500/30"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {initials}
        </div>
        <div className="hidden sm:block text-left max-w-[140px]">
          <p className="text-sm font-medium truncate leading-tight">{user.full_name}</p>
          <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[200] mt-2 w-56 rounded-xl border border-border bg-card shadow-xl p-2 animate-in fade-in-0 zoom-in-95"
        >
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-sm font-semibold truncate">{user.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span className="capitalize">{user.role} account</span>
          </div>
          <button
            type="button"
            role="menuitem"
            disabled={loggingOut}
            onClick={() => void handleLogout()}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400 transition-colors disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      )}
    </div>
  );
}
