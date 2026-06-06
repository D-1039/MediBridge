"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api-client";

export function VisionSetupBanner() {
  const [ocrInfo, setOcrInfo] = useState<{
    configured?: boolean;
    engine?: string;
    mode?: string;
    billingRequired?: boolean;
  } | null>(null);

  const check = () => {
    fetch(`${API_URL}/api/health`)
      .then((r) => r.json())
      .then((d) => setOcrInfo(d.ocr ?? null))
      .catch(() => setOcrInfo({ configured: false }));
  };

  useEffect(() => {
    check();
  }, []);

  if (ocrInfo === null) return null;

  const freeMode =
    ocrInfo.engine === "tesseract" || ocrInfo.mode === "free_local";

  if (freeMode) {
    return (
      <div className="mb-6 rounded-xl border border-teal-500/40 bg-teal-500/10 p-4">
        <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
          Free local OCR (no Google billing)
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Medicine labels are read on your machine with Tesseract. Use a clear, well-lit photo.
        </p>
      </div>
    );
  }

  if (ocrInfo.configured) return null;

  return (
    <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-5">
      <div className="flex gap-3">
        <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-3">
          <div>
            <p className="font-semibold text-red-700 dark:text-red-300">
              OCR not configured
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Add <code className="text-xs bg-muted px-1">OCR_ENGINE=tesseract</code> in{" "}
              <code className="text-xs bg-muted px-1">backend/.env</code> for free OCR (no
              billing), or set up Google Vision if you prefer cloud OCR.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={check}>
            <RefreshCw className="h-4 w-4" />
            Check again
          </Button>
        </div>
      </div>
    </div>
  );
}
