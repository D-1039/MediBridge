"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Package, User, ScanLine, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/format";

interface VerificationMedicine {
  id: string;
  name: string;
  quantity: number;
  expiryDate: string;
  category: string;
  donor: string;
  status: string;
  image: string;
  ocrConfidence: number;
}

export function VerificationCard({ medicine }: { medicine: VerificationMedicine }) {
  const [status, setStatus] = useState(medicine.status);

  const handleAction = (action: "approved" | "rejected") => {
    setStatus(action);
    toast.success(
      action === "approved" ? "Medicine approved!" : "Medicine rejected",
      { description: `${medicine.name} has been ${action}` }
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-card border-0 shadow-lg overflow-hidden">
        <div className="grid sm:grid-cols-[200px_1fr]">
          <div className="bg-gradient-to-br from-sky-500/10 to-teal-500/10 p-6 flex items-center justify-center min-h-[180px]">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center shadow-lg">
              <Package className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold">{medicine.name}</h3>
                <p className="text-sm text-muted-foreground">{medicine.category}</p>
              </div>
              <Badge
                variant={
                  status === "approved"
                    ? "success"
                    : status === "rejected"
                    ? "destructive"
                    : "warning"
                }
              >
                {status}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-sky-500" />
                Expiry: <span className="text-foreground font-medium">{formatDate(medicine.expiryDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4 text-teal-500" />
                Qty: <span className="text-foreground font-medium">{medicine.quantity}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 text-emerald-500" />
                Donor: <span className="text-foreground font-medium">{medicine.donor}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ScanLine className="h-4 w-4 text-sky-500" />
                OCR: <span className="text-foreground font-medium">{medicine.ocrConfidence}%</span>
              </div>
            </div>

            {status === "pending" && (
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => handleAction("approved")}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleAction("rejected")}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
