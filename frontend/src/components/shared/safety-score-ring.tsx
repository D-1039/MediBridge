"use client";

import { motion } from "framer-motion";
import { Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function getRiskLevel(score: number): {
  label: string;
  color: string;
  ring: string;
} {
  if (score >= 80) {
    return {
      label: "Low Risk",
      color: "text-green-600 dark:text-green-400",
      ring: "stroke-green-600",
    };
  }
  if (score >= 55) {
    return {
      label: "Moderate Risk",
      color: "text-amber-600 dark:text-amber-400",
      ring: "stroke-amber-500",
    };
  }
  return {
    label: "High Risk — Review Required",
    color: "text-red-600 dark:text-red-400",
    ring: "stroke-red-500",
  };
}

export function SafetyScoreRing({
  score,
  verified = false,
  className,
}: {
  score: number;
  verified?: boolean;
  className?: string;
}) {
  const safe = Math.min(100, Math.max(0, Math.round(score)));
  const risk = getRiskLevel(safe);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (safe / 100) * circumference;

  return (
    <div
      className={cn("flex items-center gap-4", className)}
      title="Based on expiry, batch/name, manufacturing date, and pharmacist verification"
    >
      <div className="relative h-24 w-24 shrink-0">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            strokeWidth="8"
            className="stroke-muted/40"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={risk.ring}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-xl font-bold tabular-nums", risk.color)}>
            {safe}%
          </span>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <Shield className={cn("h-4 w-4", risk.color)} />
          <span className="font-semibold text-sm">Safety Score</span>
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className={cn("text-sm font-medium mt-0.5", risk.color)}>
          Risk Level: {risk.label}
        </p>
        {verified && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Pharmacist verified — score boosted
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-2 max-w-[200px] leading-relaxed">
          Expiry window, batch/name fields, manufacturing date, pharmacist review
        </p>
      </div>
    </div>
  );
}
