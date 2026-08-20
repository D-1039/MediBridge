"use client";

import { useEffect, useState } from "react";
import { Loader2, Pill, Sparkles, User, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { api, ApiError } from "@/lib/api-client";
import type { MedicineRecord } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDate } from "@/utils/format";

export function AvailableMedicinesPanel({
  onSelectMedicine,
}: {
  onSelectMedicine?: (medicineName: string) => void;
}) {
  const [medicines, setMedicines] = useState<MedicineRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await api.listMedicines(12);
        if (!active) return;
        setMedicines(data.medicines || []);
      } catch (err) {
        if (!active) return;
        toast.error(
          err instanceof ApiError ? err.message : "Failed to load approved medicines"
        );
        setMedicines([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Card className="glass-card border-0 shadow-xl mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-green-600" />
          Approved Medicines for Receiver Accounts
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          These are donor uploads that pharmacists already approved for redistribution.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : medicines.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No approved medicines are available yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {medicines.map((medicine, index) => (
              <motion.div
                key={medicine.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <div className="h-full rounded-2xl border bg-background/70 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-green-600/10">
                        <Pill className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold leading-tight">
                          {medicine.medicine_name || "Unnamed medicine"}
                        </h3>
                        {medicine.dosage && (
                          <p className="text-xs text-muted-foreground">
                            {medicine.dosage}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="success">Approved</Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Donor: {medicine.donor_name || "Unknown"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-green-600" />
                      Available: {medicine.available_quantity ?? medicine.quantity}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      Expiry: {medicine.expiry_date ? formatDate(medicine.expiry_date) : "No expiry listed"}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        if (medicine.medicine_name) {
                          onSelectMedicine?.(medicine.medicine_name);
                        }
                      }}
                    >
                      Request medicine
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}