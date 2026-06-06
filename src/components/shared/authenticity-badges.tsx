"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ScanLine, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthenticityBadges({
  hasOcrReference = false,
  pharmacistVerified = false,
  safeToRedistribute = false,
  className,
}: {
  hasOcrReference?: boolean;
  pharmacistVerified?: boolean;
  safeToRedistribute?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {pharmacistVerified && (
        <Badge variant="success" className="gap-1.5 px-2.5 py-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          Verified by Pharmacist
        </Badge>
      )}
      {hasOcrReference && (
        <Badge
          variant="secondary"
          className="gap-1.5 px-2.5 py-1 bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30"
        >
          <ScanLine className="h-3.5 w-3.5" />
          OCR Reference on File
        </Badge>
      )}
      {safeToRedistribute && (
        <Badge variant="success" className="gap-1.5 px-2.5 py-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Safe to Redistribute
        </Badge>
      )}
    </div>
  );
}
