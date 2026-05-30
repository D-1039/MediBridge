"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/upload", icon: Upload, label: "Upload" },
  { href: "/dashboard/requests", icon: ClipboardList, label: "Requests" },
  { href: "/dashboard/verification", icon: ShieldCheck, label: "Verify" },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t px-2 py-2">
      <div className="flex justify-around">
        {links.map((link) => {
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
                isActive ? "text-sky-500" : "text-muted-foreground"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
