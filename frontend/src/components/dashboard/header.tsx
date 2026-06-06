"use client";

import Link from "next/link";
import { Bell, LogOut, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserAccountMenu } from "@/components/dashboard/user-account-menu";
import { useAuth } from "@/contexts/auth-provider";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-wrap justify-end">
        {user?.role === "donor" && (
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/login?portal=pharmacist">Pharmacist login?</Link>
          </Button>
        )}
        {user?.role && (
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted capitalize hidden sm:inline">
            {user.role}
          </span>
        )}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 w-64" />
        </div>
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>
        <ThemeToggle />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="sm:hidden text-red-600 border-red-200 hover:bg-red-500/10 dark:border-red-900/50"
          onClick={() => void logout()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
        <UserAccountMenu />
      </div>
    </header>
  );
}
