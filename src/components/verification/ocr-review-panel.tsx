"use client";

import { ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

export function OcrReviewPanel({
  medicineName,
  batchNumber,
  expiryDate,
  manufacturingDate,
  ocrText,
}: {
  medicineName?: string | null;
  batchNumber?: string | null;
  expiryDate?: string | null;
  manufacturingDate?: string | null;
  ocrText?: string | null;
}) {
  const fields = [
    { label: "Medicine Name", value: medicineName },
    { label: "Batch Number", value: batchNumber },
    { label: "Manufacturing Date", value: manufacturingDate },
    { label: "Expiry Date", value: expiryDate },
  ];

  return (
    <div className="rounded-xl border border-sky-500/25 bg-sky-500/5 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-sky-500/20 bg-sky-500/10">
        <div className="flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-sky-500" />
          <span className="text-sm font-semibold">OCR Review Panel</span>
        </div>
        <span className="text-xs text-muted-foreground">Reference only</span>
      </div>
      <div className="p-4 grid sm:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.label} className="rounded-lg bg-background/60 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {f.label}
            </p>
            <p
              className={cn(
                "text-sm font-medium mt-0.5",
                !f.value && "text-muted-foreground italic"
              )}
            >
              {f.value || "Not detected"}
            </p>
          </div>
        ))}
      </div>
      {ocrText && (
        <div className="px-4 pb-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Raw OCR text
          </p>
          <pre className="text-xs bg-muted/50 rounded-lg p-3 max-h-28 overflow-auto whitespace-pre-wrap font-mono">
            {ocrText.slice(0, 600)}
            {ocrText.length > 600 ? "…" : ""}
          </pre>
        </div>
      )}
    </div>
  );
}
