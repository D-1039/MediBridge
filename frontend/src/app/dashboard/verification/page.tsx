"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, CheckCircle2, XCircle, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/header";
import { PharmacistVerificationCard } from "@/components/verification/pharmacist-verification-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { api } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-provider";
import { useRouter } from "next/navigation";
import type { MedicineRecord, PharmacistStats } from "@/types/api";

export default function VerificationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [medicines, setMedicines] = useState<MedicineRecord[]>([]);
  const [stats, setStats] = useState<PharmacistStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [data, s] = await Promise.all([
        api.listPendingVerification(),
        api.getPharmacistStats(),
      ]);
      setMedicines(data);
      setStats(s);
    } catch {
      toast.error("Failed to load verification queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== "pharmacist" && user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    void load();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const pending = medicines.filter(
    (m) => m.status === "pending_pharmacist" || m.status === "manual_review"
  ).length;

  return (
    <div>
      <DashboardHeader
        title={
          user?.role === "pharmacist"
            ? "Pharmacist Portal — Approve / Reject"
            : "Pharmacist Verification"
        }
        subtitle="Review donor uploads: check OCR, safety score, then Approve (verified) or Reject"
      />

      <div className="mb-6 rounded-xl border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm text-green-900 dark:text-green-100">
        <strong>How to use:</strong> Open each medicine card → verify photo &amp; OCR
        fields → optional notes → click <strong>Approve</strong> (safe to redistribute)
        or <strong>Reject</strong>. Donors must upload first from Upload Medicine page.
      </div>

      {stats && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pending Verifications"
            value={stats.pending_verifications}
            change={`${pending} in current queue`}
            icon={ClipboardList}
            gradient="from-amber-500 to-orange-600"
            delay={0}
          />
          <StatCard
            title="Approved Medicines"
            value={stats.approved_medicines}
            icon={CheckCircle2}
            gradient="from-green-600 to-green-700"
            delay={0.05}
          />
          <StatCard
            title="Rejected Medicines"
            value={stats.rejected_medicines}
            icon={XCircle}
            gradient="from-red-500 to-rose-600"
            delay={0.1}
          />
          <StatCard
            title="Today's Reviews"
            value={stats.todays_reviews}
            icon={ShieldCheck}
            gradient="from-blue-600 to-green-600"
            delay={0.15}
          />
        </div>
      )}

      <div className="space-y-6">
        {medicines.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 glass-card rounded-xl">
            No medicines pending verification. Great work!
          </p>
        ) : (
          medicines.map((medicine) => (
            <PharmacistVerificationCard
              key={medicine.id}
              medicine={medicine}
              onApprove={async (id, notes) => {
                await api.approveMedicine(id, notes);
                await load();
              }}
              onReject={async (id, notes) => {
                await api.rejectMedicine(id, notes);
                await load();
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
