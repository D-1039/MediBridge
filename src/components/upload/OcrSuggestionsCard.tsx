"use client";

import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayDate } from "@/lib/ocr-utils";
import type { OcrSuggestions } from "@/types/ocr";

export function OcrSuggestionsCard({
  suggestions,
  disclaimer,
  onAccept,
  onDismiss,
}: {
  suggestions: OcrSuggestions;
  disclaimer?: string;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <Card className="glass-card border border-dashed border-sky-500/40 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-sky-500" />
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
          <SuggestRow label="Batch Number" value={suggestions.batch_number} />
        </dl>
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
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="font-medium mt-0.5">{value || "—"}</dd>
    </div>
  );
}
