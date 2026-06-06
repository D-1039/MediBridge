"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Users, Clock, Pill, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/format";
import {
  SmartMatchCard,
  type SmartMatch,
} from "@/components/requests/smart-match-card";

interface MedicineRequest {
  id: string;
  medicine: string;
  urgency: "urgent" | "normal";
  requester: string;
  patientInfo: string;
  status: "pending" | "approved";
  location: string;
  date: string;
  smart_match?: SmartMatch | null;
}

export function RequestCard({
  request,
  showActions,
  onApprove,
  onReject,
}: {
  request: MedicineRequest;
  showActions?: boolean;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  const run = async (fn?: (id: string) => Promise<void>) => {
    if (!fn) return;
    setBusy(true);
    try {
      await fn(request.id);
      toast.success("Request updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                <Pill className="h-6 w-6 text-sky-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{request.medicine}</h3>
                <p className="text-sm text-muted-foreground">{request.requester}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={request.urgency === "urgent" ? "urgent" : "secondary"}>
                {request.urgency}
              </Badge>
              <Badge variant={request.status === "approved" ? "success" : "warning"}>
                {request.status}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-500" />
              {request.patientInfo}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-500" />
              {request.location}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatDate(request.date)}
            </div>
          </div>

          {request.smart_match && request.status === "pending" && (
            <SmartMatchCard match={request.smart_match} />
          )}

          {showActions && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button
                size="sm"
                className="flex-1"
                disabled={busy}
                onClick={() => run(onApprove)}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                disabled={busy}
                onClick={() => run(onReject)}
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
