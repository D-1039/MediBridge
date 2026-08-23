"use client";

import { Check, X, Sparkles, AlertTriangle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayDate } from "@/lib/ocr-utils";
import type { OcrSuggestions } from "@/types/ocr";

export function OcrSuggestionsCard({
  suggestions,
  disclaimer,
  onAccept,
  onDismiss,
  batchNumberConfidence,
  batchNumberNeedsReview,
  onRetake,
}: {
  suggestions: OcrSuggestions;
  disclaimer?: string;
  onAccept: () => void;
  onDismiss: () => void;
  batchNumberConfidence?: number | null;
  batchNumberNeedsReview?: boolean;
  onRetake?: () => void;
}) {
  return (
    <Card className="glass-card border border-dashed border-blue-600/40 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-blue-600" />
          Suggested Details (Optional)
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {disclaimer ||
            "OCR may be wrong on foil strips. Verify against the physical label."}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <SuggestRow label="Medicine Name" value={suggestions.medicine_name} />
          <SuggestRow
            label="Manufacturing Date"
            value={formatDisplayDate(suggestions.manufacturing_date)}
          />
          <SuggestRow
            label="Expiry Date"
            value={formatDisplayDate(suggestions.expiry_date)}
          />
          <SuggestRow
            label="Batch Number"
            value={suggestions.batch_number}
            review={batchNumberNeedsReview}
            confidence={batchNumberConfidence}
          />
        </dl>
        {batchNumberNeedsReview && (
          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
            <p className="flex gap-2 font-medium"><AlertTriangle className="h-4 w-4 shrink-0" />Batch number needs verification</p>
            <p className="mt-1">Batch number text was hard to read clearly. Please retake a close, well-lit photo of just that line, or type it manually.</p>
            {onRetake && <Button type="button" size="sm" variant="outline" className="mt-2" onClick={onRetake}><Upload className="h-4 w-4" />Retake Photo</Button>}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button type="button" className="flex-1" onClick={onAccept}>
            <Check className="h-4 w-4" />
            Accept Suggestions
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={onDismiss}>
            <X className="h-4 w-4" />
            Ignore
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SuggestRow({
  label,
  value,
  review = false,
  confidence,
}: {
  label: string;
  value: string | null | undefined;
  review?: boolean;
  confidence?: number | null;
}) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${review ? "border-amber-500/60 bg-amber-500/10" : "bg-muted/30"}`}>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1">{label} {review && <AlertTriangle className="h-3 w-3 text-amber-600" />}</span>
      </dt>
      <dd className="font-medium mt-0.5">{value || "—"}</dd>
      <p className={`text-[11px] mt-1 ${review ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground"}`}>
        {review ? "Unclear — please verify or retake" : confidence != null ? "OCR suggestion" : ""}
      </p>
    </div>
  );
}
