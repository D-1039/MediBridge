"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRequestStatusLabel } from "@/lib/request-utils";
import type { DonationRequestRecord } from "@/types/api";
import { formatDate } from "@/utils/format";

export function RequestSuccessCard({
  request,
  onDismiss,
}: {
  request: DonationRequestRecord;
  onDismiss?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-card border-green-600/30 shadow-xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">Request Submitted Successfully</h3>
              <p className="text-sm text-muted-foreground">
                Your request has been saved and sent for pharmacist review.
              </p>
            </div>
          </div>
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Request ID</dt>
              <dd className="font-mono font-medium">
                {request.request_code || request.id.slice(0, 8)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Medicine</dt>
              <dd className="font-medium">{request.medicine_name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Quantity</dt>
              <dd className="font-medium">
                {request.requested_quantity || 1} strip(s)
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created At</dt>
              <dd className="font-medium">{formatDate(request.created_at)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground mb-1">Current Status</dt>
              <dd>
                <Badge variant="warning">
                  {getRequestStatusLabel(request.status)}
                </Badge>
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild size="sm">
              <Link href="/dashboard/requests">View My Requests</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                Create Another
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
