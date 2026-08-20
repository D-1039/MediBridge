"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHomePathForRole } from "@/lib/role-routes";
import { Pill, Clock, Building2, TrendingDown, Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DonationsChart, WasteReductionChart } from "@/components/dashboard/charts";
import { DonationsTable, RequestsTable } from "@/components/dashboard/data-table";
import { api } from "@/lib/api-client";
import { medicineToDonationRow, requestToCard } from "@/lib/mappers";
import { useAuth } from "@/contexts/auth-provider";
import type { ApiUser } from "@/types/api";
import { loadRequestsForRole } from "@/lib/load-requests";
import { ImpactBanner } from "@/components/shared/impact-banner";
import { SocialImpactCards } from "@/components/shared/social-impact-cards";
import {
  MonthlyDonationChart,
  TopMedicinesBarChart,
  VerificationRateChart,
} from "@/components/admin/admin-analytics-charts";

async function loadDonationsForRole(
  user: ApiUser
): Promise<ReturnType<typeof medicineToDonationRow>[]> {
  if (user.role === "donor") {
    const mine = await api.listMyDonations();
    return mine.slice(0, 5).map((m) =>
      medicineToDonationRow({
        ...m,
        donor_name: user.full_name,
      })
    );
  }
  const { medicines } = await api.listMedicines(5);
  return medicines.map(medicineToDonationRow);
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    medicinesSaved: 0,
    pendingVerification: 0,
    activeNgos: 0,
    wasteReduction: 0,
  });
  const [donations, setDonations] = useState<
    ReturnType<typeof medicineToDonationRow>[]
  >([]);
  const [requests, setRequests] = useState<ReturnType<typeof requestToCard>[]>(
    []
  );
  const [analytics, setAnalytics] = useState<Awaited<
    ReturnType<typeof api.getDashboardAnalytics>
  > | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    const home = getHomePathForRole(user.role);
    if (home !== "/dashboard") {
      router.replace(home);
      return;
    }

    async function load() {
      setLoadError(null);
      try {
        const analyticsData = await api.getDashboardAnalytics();
        setAnalytics(analyticsData);

        let medicinesRows: ReturnType<typeof medicineToDonationRow>[] = [];
        let requestRows: ReturnType<typeof requestToCard>[] = [];

        try {
          medicinesRows = await loadDonationsForRole(user);
        } catch {
          medicinesRows = [];
        }

        try {
          const reqData = await loadRequestsForRole(user);
          requestRows = reqData.slice(0, 5).map(requestToCard);
        } catch {
          requestRows = [];
        }

        const wastePct = analyticsData.total_medicines_donated
          ? Math.round(
              ((analyticsData.strips_saved || 0) /
                analyticsData.total_medicines_donated) *
                100
            )
          : 0;

        setStats({
          medicinesSaved: analyticsData.total_medicines_donated,
          pendingVerification: analyticsData.total_pending_verification,
          activeNgos: analyticsData.total_beneficiaries,
          wasteReduction: Math.min(wastePct, 100),
        });
        setDonations(medicinesRows);
        setRequests(requestRows);
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Could not load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [authLoading, user, router]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title="Dashboard"
        subtitle="Live data from MediBridge API"
      />

      {loadError && (
        <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {loadError}. Make sure the backend is running on port 5000.
        </p>
      )}

      {analytics && (
        <>
          <ImpactBanner
            metrics={{
              medicines_rescued:
                analytics.medicines_rescued ?? analytics.total_approved,
              patients_helped:
                analytics.patients_helped ?? analytics.total_beneficiaries,
              waste_prevented_kg: analytics.estimated_waste_prevented_kg,
              cost_saved_inr:
                analytics.cost_saved_inr ??
                (analytics.strips_saved || 0) * 25,
            }}
          />
          <SocialImpactCards
            metrics={{
              medicines_rescued:
                analytics.medicines_rescued ?? analytics.total_approved,
              patients_helped:
                analytics.patients_helped ?? analytics.total_beneficiaries,
              waste_prevented_kg: analytics.estimated_waste_prevented_kg,
              cost_saved_inr:
                analytics.cost_saved_inr ??
                (analytics.strips_saved || 0) * 25,
            }}
          />
        </>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Medicines Saved"
          value={stats.medicinesSaved.toLocaleString()}
          change={`${stats.medicinesSaved} total donated`}
          icon={Pill}
          gradient="from-blue-600 to-blue-700"
          delay={0}
        />
        <StatCard
          title="Pending Verification"
          value={stats.pendingVerification}
          change="Awaiting pharmacist"
          icon={Clock}
          gradient="from-amber-500 to-orange-600"
          delay={0.1}
        />
        <StatCard
          title="Beneficiaries"
          value={stats.activeNgos}
          change="Completed distributions"
          icon={Building2}
          gradient="from-green-600 to-blue-600"
          delay={0.2}
        />
        <StatCard
          title="Strips Saved"
          value={`${stats.wasteReduction}%`}
          change="Approved + distributed"
          icon={TrendingDown}
          gradient="from-green-600 to-green-700"
          delay={0.3}
        />
      </div>

      {analytics && (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {analytics.monthly_donation_growth &&
          analytics.monthly_donation_growth.length > 0 ? (
            <MonthlyDonationChart data={analytics.monthly_donation_growth} />
          ) : (
            <DonationsChart />
          )}
          <VerificationRateChart
            rate={analytics.verification_success_rate ?? 0}
          />
          {analytics.most_donated && analytics.most_donated.length > 0 && (
            <TopMedicinesBarChart
              data={analytics.most_donated.map((d) => ({
                name: d.name,
                donations: d.donations,
              }))}
              title="Most Donated Medicines"
            />
          )}
          <WasteReductionChart
            data={[
              { name: "Reduced", value: stats.wasteReduction, fill: "#16A34A" },
              {
                name: "Remaining",
                value: Math.max(100 - stats.wasteReduction, 0),
                fill: "#e2e8f0",
              },
            ]}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <DonationsTable data={donations} />
        <RequestsTable data={requests} />
      </div>
    </div>
  );
}
