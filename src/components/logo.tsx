import { HeartPulse } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
        <HeartPulse className="h-5 w-5 text-white" />
      </div>
      {showText && (
        <span className="text-xl font-bold tracking-tight">
          Medi<span className="gradient-text">Bridge</span>
        </span>
      )}
    </Link>
  );
}
