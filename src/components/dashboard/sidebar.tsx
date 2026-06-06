"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  ClipboardList,
  ShieldCheck,
  LogOut,
  Settings2,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { sidebarLinks } from "@/services/mock-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-provider";

const iconMap = {
  LayoutDashboard,
  Upload,
  ClipboardList,
  ShieldCheck,
  Settings2,
} as const;

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = sidebarLinks.filter((link) => {
    if (link.href === "/dashboard/admin") {
      return user?.role === "admin";
    }
    if (link.href === "/dashboard/verification") {
      return user?.role === "pharmacist" || user?.role === "admin";
    }
    if (link.href === "/dashboard/upload") {
      return user?.role === "donor" || user?.role === "admin";
    }
    return true;
  });

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-card/50 backdrop-blur min-h-screen p-6">
      <Logo className="mb-8" />
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = iconMap[link.icon as keyof typeof iconMap];
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-sky-500/10 to-teal-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => void logout()}
        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-900/50 hover:bg-red-500/10 transition-all mt-auto"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </aside>
  );
}
