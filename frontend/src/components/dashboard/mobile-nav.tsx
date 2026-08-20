"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  ClipboardList,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-provider";

const links = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/admin", icon: ShieldCheck, label: "Admin" },
  { href: "/dashboard/upload", icon: Upload, label: "Upload" },
  { href: "/dashboard/requests", icon: ClipboardList, label: "Requests" },
  { href: "/dashboard/verification", icon: ShieldCheck, label: "Approve" },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const visible = links.filter((link) => {
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex justify-around items-end">
        {visible.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs transition-colors",
                isActive ? "text-blue-600" : "text-muted-foreground"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => void logout()}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs text-red-600 dark:text-red-400 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </nav>
  );
}
