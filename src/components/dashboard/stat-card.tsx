"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  gradient: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  gradient,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {change && (
            <p className="text-xs text-emerald-600 mt-1 font-medium">{change}</p>
          )}
        </div>
        <div
          className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
            gradient
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
