"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { VerificationCard } from "@/components/verification/verification-card";
import { verificationMedicines } from "@/services/mock-data";

export default function VerificationPage() {
  const pending = verificationMedicines.filter((m) => m.status === "pending").length;

  return (
    <div>
      <DashboardHeader
        title="Pharmacist Verification"
        subtitle={`${pending} medicines awaiting your review`}
      />
      <div className="space-y-6">
        {verificationMedicines.map((medicine) => (
          <VerificationCard key={medicine.id} medicine={medicine} />
        ))}
      </div>
    </div>
  );
}
