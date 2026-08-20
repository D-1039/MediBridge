"use client";

import { motion } from "framer-motion";
import { PackageCheck, Truck } from "lucide-react";
import { normalizeRequestStatus } from "@/lib/request-utils";

export function CollectionStatusCard({ status }: { status: string }) {
  const normalized = normalizeRequestStatus(status);

  if (normalized === "ready_for_collection") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border-2 border-green-600/50 bg-gradient-to-br from-green-600/15 to-green-600/10 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-green-600 flex items-center justify-center">
            <PackageCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-700 dark:text-green-300">
              Ready For Collection
            </p>
            <p className="text-sm text-muted-foreground">
              Your assigned medicine is ready to collect.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (normalized === "completed") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border-2 border-blue-600/50 bg-gradient-to-br from-blue-600/15 to-blue-600/10 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-blue-700 dark:text-blue-300">
              Distribution Completed
            </p>
            <p className="text-sm text-muted-foreground">
              Medicine has been successfully distributed.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
