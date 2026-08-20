"use client";

import { useEffect, useState } from "react";
import { Loader2, User, Pill, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api-client";
import {
  getRequestStatusLabel,
  getRequestStatusVariant,
  normalizeRequestStatus,
} from "@/lib/request-utils";
import type { DonationRequestRecord, InventoryMatch } from "@/types/api";
import { formatDate } from "@/utils/format";
import { RequestTimeline } from "@/components/receiver/request-timeline";

export function PharmacistRequestCard({
  request,
  onUpdated,
}: {
  request: DonationRequestRecord;
  onUpdated: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryMatch[]>([]);
  const [assignMedicineId, setAssignMedicineId] = useState(
    request.assigned_medicine_id || request.medicine_id
  );
  const [assignQty, setAssignQty] = useState(
    String(request.assigned_quantity || request.requested_quantity || 1)
  );

  const status = normalizeRequestStatus(request.status);

  useEffect(() => {
    void api
      .suggestMedicines(request.medicine_name || "", 8)
      .then((data) => setInventory(data.suggestions))
      .catch(() => setInventory([]));
  }, [request.medicine_name]);

  const run = async (action: string, fn: () => Promise<unknown>) => {
    setBusy(action);
    try {
      await fn();
      toast.success("Request updated");
      onUpdated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="glass-card border-0 shadow-lg">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted-foreground">
              {request.request_code || request.id.slice(0, 8)}
            </p>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-600" />
              {request.medicine_name}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <User className="h-3.5 w-3.5" />
              {request.receiver_name} · Qty {request.requested_quantity || 1}
            </p>
          </div>
          <Badge variant={getRequestStatusVariant(request.status)}>
            {getRequestStatusLabel(request.status)}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <RequestTimeline
            status={request.status}
            history={request.status_history}
          />
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Available Medicines
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {inventory.map((item) => (
                <button
                  key={item.medicine_id}
                  type="button"
                  onClick={() => setAssignMedicineId(item.medicine_id)}
                  className={`w-full text-left rounded-lg border p-2 text-sm ${
                    assignMedicineId === item.medicine_id
                      ? "border-green-600 bg-green-600/10"
                      : "hover:border-muted-foreground/40"
                  }`}
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{item.medicine_name}</span>
                    <span className="text-muted-foreground">
                      {item.available_quantity} avail · {item.match_score}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Assign Qty</label>
                <Input
                  type="number"
                  min={1}
                  value={assignQty}
                  onChange={(e) => setAssignQty(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {(status === "submitted" || status === "pending") && (
            <Button
              size="sm"
              disabled={!!busy}
              onClick={() =>
                run("review", () => api.reviewRequest(request.id))
              }
            >
              {busy === "review" && <Loader2 className="h-4 w-4 animate-spin" />}
              Start Review
            </Button>
          )}
          {["submitted", "under_review", "pending"].includes(status) && (
            <Button
              size="sm"
              disabled={!!busy}
              onClick={() =>
                run("assign", () =>
                  api.assignRequest(
                    request.id,
                    assignMedicineId,
                    parseInt(assignQty, 10) || 1
                  )
                )
              }
            >
              {busy === "assign" && <Loader2 className="h-4 w-4 animate-spin" />}
              <Package className="h-4 w-4" />
              Assign Medicine
            </Button>
          )}
          {status === "assigned" && (
            <Button
              size="sm"
              disabled={!!busy}
              onClick={() =>
                run("ready", () => api.markRequestReady(request.id))
              }
            >
              Mark Ready For Collection
            </Button>
          )}
          {["assigned", "ready_for_collection", "approved"].includes(
            status
          ) && (
            <Button
              size="sm"
              variant="secondary"
              disabled={!!busy}
              onClick={() =>
                run("complete", () => api.completeRequest(request.id))
              }
            >
              Mark Completed
            </Button>
          )}
          {status !== "completed" && status !== "rejected" && (
            <Button
              size="sm"
              variant="destructive"
              disabled={!!busy}
              onClick={() =>
                run("reject", () => api.rejectRequest(request.id))
              }
            >
              Reject
            </Button>
          )}
        </div>

        {request.assigned_medicine_name && (
          <p className="text-xs text-muted-foreground">
            Assigned: {request.assigned_medicine_name} ×{" "}
            {request.assigned_quantity} on{" "}
            {request.assigned_at ? formatDate(request.assigned_at) : "—"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
