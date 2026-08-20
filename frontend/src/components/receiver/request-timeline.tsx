"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  REQUEST_STATUS_FLOW,
  normalizeRequestStatus,
  getRequestStatusLabel,
} from "@/lib/request-utils";
import type { RequestStatusHistoryEntry } from "@/types/api";
import { formatDate } from "@/utils/format";

export function RequestTimeline({
  status,
  history = [],
}: {
  status: string;
  history?: RequestStatusHistoryEntry[];
}) {
  const current = normalizeRequestStatus(status);
  const currentIndex = REQUEST_STATUS_FLOW.indexOf(
    current as (typeof REQUEST_STATUS_FLOW)[number]
  );

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Request Timeline
      </p>
      <ol className="space-y-3">
        {REQUEST_STATUS_FLOW.map((step, index) => {
          const done = currentIndex >= index || current === "completed";
          const active = current === step;
          const historyEntry = history.find(
            (h) => normalizeRequestStatus(h.status) === step
          );
          return (
            <li key={step} className="flex gap-3">
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center shrink-0 border-2",
                  done
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    active && "text-blue-600 dark:text-blue-400"
                  )}
                >
                  {getRequestStatusLabel(step)}
                </p>
                {historyEntry && (
                  <p className="text-xs text-muted-foreground">
                    {formatDate(historyEntry.created_at)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
