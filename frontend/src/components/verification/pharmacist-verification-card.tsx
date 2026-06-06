"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Package,
  User,
  Check,
  X,
  Loader2,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/utils/format";
import { ApiError } from "@/lib/api-client";
import { OcrReviewPanel } from "@/components/verification/ocr-review-panel";
import { SafetyScoreRing } from "@/components/shared/safety-score-ring";
import { AuthenticityBadges } from "@/components/shared/authenticity-badges";
import { MedicineJourneyTimeline } from "@/components/shared/medicine-journey-timeline";
import type { MedicineRecord } from "@/types/api";

export function PharmacistVerificationCard({
  medicine,
  onApprove,
  onReject,
}: {
  medicine: MedicineRecord;
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, notes?: string) => Promise<void>;
}) {
  const pending =
    medicine.status === "pending_pharmacist" ||
    medicine.status === "manual_review";
  const [status, setStatus] = useState(medicine.status);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const safetyScore = Math.round(Number(medicine.safety_score) || 0);
  const displayStatus = pending
    ? "pending"
    : status === "approved" || status === "distributed"
      ? "approved"
      : status === "rejected"
        ? "rejected"
        : status;

  const handleAction = async (action: "approved" | "rejected") => {
    setLoading(action === "approved" ? "approve" : "reject");
    try {
      if (action === "approved") await onApprove(medicine.id, notes);
      else await onReject(medicine.id, notes);
      setStatus(action === "approved" ? "approved" : "rejected");
      toast.success(
        action === "approved"
          ? "Medicine verified & approved"
          : "Medicine rejected",
        {
          description:
            action === "approved"
              ? "Status → Verified (approved for redistribution)"
              : "Status → Rejected",
        }
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="glass-card border-0 shadow-lg overflow-hidden">
        <div className="grid lg:grid-cols-[220px_1fr]">
          <div className="bg-gradient-to-br from-sky-500/10 to-teal-500/10 p-6 flex items-center justify-center min-h-[200px]">
            {medicine.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={medicine.image_url}
                alt={medicine.medicine_name || "Medicine"}
                className="max-h-48 rounded-xl object-contain shadow-md"
              />
            ) : (
              <Package className="h-16 w-16 text-sky-500/50" />
            )}
          </div>
          <CardContent className="p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">
                  {medicine.medicine_name || "Unknown medicine"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {medicine.dosage || "General"} • Qty {medicine.quantity}
                </p>
              </div>
              <Badge
                variant={
                  displayStatus === "approved"
                    ? "success"
                    : displayStatus === "rejected"
                      ? "destructive"
                      : "warning"
                }
              >
                {displayStatus === "approved"
                  ? "Verified"
                  : displayStatus === "rejected"
                    ? "Rejected"
                    : "Pending review"}
              </Badge>
            </div>

            <AuthenticityBadges
              hasOcrReference={Boolean(medicine.ocr_text)}
              pharmacistVerified={
                displayStatus === "approved" || status === "distributed"
              }
              safeToRedistribute={displayStatus === "approved"}
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-sky-500 shrink-0" />
                <span>
                  Expiry:{" "}
                  <strong className="text-foreground">
                    {medicine.expiry_date
                      ? formatDate(medicine.expiry_date.slice(0, 10))
                      : "—"}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4 text-teal-500 shrink-0" />
                <span>
                  Batch:{" "}
                  <strong className="text-foreground">
                    {medicine.batch_number || "—"}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>
                  Donor:{" "}
                  <strong className="text-foreground">
                    {medicine.donor_name || "—"}
                  </strong>
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <SafetyScoreRing
                score={safetyScore}
                verified={displayStatus === "approved"}
              />
              <MedicineJourneyTimeline
                status={medicine.status}
                hasOcr={Boolean(medicine.ocr_text)}
              />
            </div>

            <OcrReviewPanel
              medicineName={medicine.medicine_name}
              batchNumber={medicine.batch_number}
              expiryDate={medicine.expiry_date?.slice(0, 10)}
              manufacturingDate={medicine.manufacturing_date?.slice(0, 10)}
              ocrText={medicine.ocr_text}
            />

            {displayStatus === "pending" && (
              <>
                <Textarea
                  placeholder="Pharmacist notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                    disabled={!!loading}
                    onClick={() => handleAction("approved")}
                  >
                    {loading === "approve" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={!!loading}
                    onClick={() => handleAction("rejected")}
                  >
                    {loading === "reject" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Reject
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
