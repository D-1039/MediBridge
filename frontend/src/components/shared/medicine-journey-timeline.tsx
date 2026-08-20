"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Package,
  ScanLine,
  ShieldCheck,
  Truck,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StepId =
  | "uploaded"
  | "ocr"
  | "verified"
  | "matched"
  | "delivered";

const STEPS: { id: StepId; label: string; icon: typeof Package }[] = [
  { id: "uploaded", label: "Uploaded", icon: Package },
  { id: "ocr", label: "Submitted", icon: ScanLine },
  { id: "verified", label: "Pharmacist Verified", icon: ShieldCheck },
  { id: "matched", label: "Approved for Redistribution", icon: Link2 },
  { id: "delivered", label: "Delivered", icon: Truck },
];

function stepIndex(status: string, hasOcr: boolean): Record<StepId, boolean> {
  const s = status.toLowerCase();
  const uploaded = true;
  const ocr = hasOcr || !["pending_ocr"].includes(s);
  const verified = ["approved", "distributed"].includes(s);
  const matched = ["approved", "distributed"].includes(s);
  const delivered = s === "distributed";

  return { uploaded, ocr, verified, matched, delivered };
}

export function MedicineJourneyTimeline({
  status,
  hasOcr = true,
  className,
}: {
  status: string;
  hasOcr?: boolean;
  className?: string;
}) {
  const done = stepIndex(status, hasOcr);

  return (
    <div className={cn("rounded-xl border bg-muted/20 p-4", className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Medicine Journey
      </p>
      <div className="space-y-0">
        {STEPS.map((step, i) => {
          const complete = done[step.id];
          const Icon = step.icon;
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center border-2",
                    complete
                      ? "border-green-600 bg-green-600/15 text-green-600"
                      : "border-muted-foreground/30 bg-muted text-muted-foreground"
                  )}
                >
                  {complete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </motion.div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[28px] my-1",
                      complete ? "bg-green-600/50" : "bg-border"
                    )}
                  />
                )}
              </div>
              <div className="pb-6 pt-1.5">
                <p
                  className={cn(
                    "text-sm font-medium",
                    complete ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {complete ? "Completed" : "Pending"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
