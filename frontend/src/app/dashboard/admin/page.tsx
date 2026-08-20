"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Pill,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  ClipboardList,
  Leaf,
  IndianRupee,
  Search,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ImpactBanner } from "@/components/shared/impact-banner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-provider";
import type { AdminAnalytics, MedicineRecord } from "@/types/api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form-select";
import { medicineCategories } from "@/services/mock-data";
import { medicineToDonationRow, requestToCard } from "@/lib/mappers";
import { DonationsTable, RequestsTable } from "@/components/dashboard/data-table";
import {
  MonthlyDonationChart,
  VerificationRateChart,
  TopMedicinesBarChart,
  ExpiryTrendChart,
} from "@/components/admin/admin-analytics-charts";
import {
  RequestVolumeChart,
  CompletionRateChart,
  DistributionTrendChart,
} from "@/components/admin/request-analytics-charts";
import { formatDate } from "@/utils/format";
import { Badge } from "@/components/ui/badge";

export default function AdminPanelPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [medicines, setMedicines] = useState<MedicineRecord[]>([]);
  const [recentDonations, setRecentDonations] = useState<
    ReturnType<typeof medicineToDonationRow>[]
  >([]);
  const [recentRequests, setRecentRequests] = useState<
    ReturnType<typeof requestToCard>[]
  >([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expiryFilter, setExpiryFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    try {
      const [a, meds, donations, requests] = await Promise.all([
        api.getAdminAnalytics(),
        api.listAdminMedicines(),
        api.getAdminRecentDonations(),
        api.getAdminRecentRequests(),
      ]);
      setAnalytics(a);
      setMedicines(meds);
      setRecentDonations(donations.map(medicineToDonationRow));
      setRecentRequests(requests.map(requestToCard));
    } catch {
      /* header shows empty state */
    } finally {
      setLoading(false);
    }
  };

  const loadMedicines = async () => {
    const meds = await api.listAdminMedicines({
      status: statusFilter === "all" ? undefined : statusFilter,
      search: search || undefined,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      expiry_before:
        expiryFilter === "soon"
          ? new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10)
          : undefined,
    });
    setMedicines(meds);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    void load();
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.role === "admin" && !loading) {
      const t = setTimeout(() => void loadMedicines(), 300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, categoryFilter, expiryFilter]);

  const impact = useMemo(() => {
    if (!analytics) return null;
    return {
      medicines_rescued: analytics.medicines_rescued,
      patients_helped: analytics.patients_helped,
      waste_prevented_kg: analytics.waste_prevented_kg,
      cost_saved_inr: analytics.cost_saved_inr,
      cost_saved_display: analytics.cost_saved_display,
    };
  }, [analytics]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!analytics || !impact) return null;

  return (
    <div>
      <DashboardHeader
        title="Admin Panel"
        subtitle="Platform oversight, analytics & medicine inventory"
      />

      <ImpactBanner metrics={impact} />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Medicines Collected"
          value={analytics.total_medicines_collected}
          icon={Pill}
          gradient="from-blue-600 to-blue-700"
        />
        <StatCard
          title="Verified Medicines"
          value={analytics.total_verified}
          icon={CheckCircle2}
          gradient="from-green-600 to-green-700"
        />
        <StatCard
          title="Pending Review"
          value={analytics.total_pending}
          icon={Clock}
          gradient="from-amber-500 to-orange-600"
        />
        <StatCard
          title="Rejected"
          value={analytics.total_rejected}
          icon={XCircle}
          gradient="from-red-500 to-rose-600"
        />
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Patients Helped"
          value={analytics.patients_helped}
          icon={Users}
          gradient="from-blue-600 to-blue-700"
        />
        <StatCard
          title="Active Requests"
          value={analytics.active_requests}
          icon={ClipboardList}
          gradient="from-blue-500 to-green-600"
        />
        <StatCard
          title="Waste Prevented"
          value={`${analytics.waste_prevented_kg} Kg`}
          icon={Leaf}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Cost Saved"
          value={analytics.cost_saved_display || `₹${analytics.cost_saved_inr}`}
          icon={IndianRupee}
          gradient="from-amber-500 to-yellow-600"
        />
      </div>

      <div className="glass-card rounded-xl p-4 mb-8 space-y-4">
        <h3 className="font-semibold">Search &amp; filter medicines</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search name, batch, donor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending_pharmacist">Pending pharmacist</SelectItem>
              <SelectItem value="manual_review">Manual review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="distributed">Distributed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {medicineCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={expiryFilter} onValueChange={setExpiryFilter}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Expiry filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any expiry</SelectItem>
            <SelectItem value="soon">Expiring within 90 days</SelectItem>
          </SelectContent>
        </Select>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                <th className="p-3 font-medium">Medicine</th>
                <th className="p-3 font-medium">Donor</th>
                <th className="p-3 font-medium">Expiry</th>
                <th className="p-3 font-medium">Safety</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {medicines.slice(0, 15).map((m) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-medium">{m.medicine_name || "—"}</td>
                  <td className="p-3 text-muted-foreground">{m.donor_name || "—"}</td>
                  <td className="p-3">
                    {m.expiry_date ? formatDate(m.expiry_date.slice(0, 10)) : "—"}
                  </td>
                  <td className="p-3">{Math.round(Number(m.safety_score) || 0)}%</td>
                  <td className="p-3">
                    <Badge variant="secondary" className="capitalize text-xs">
                      {m.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {analytics.request_analytics && (
        <>
          <h3 className="font-semibold mb-4">Request Analytics</h3>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Requests"
              value={analytics.request_analytics.total_requests}
              icon={ClipboardList}
              gradient="from-blue-600 to-blue-700"
            />
            <StatCard
              title="Pending Requests"
              value={analytics.request_analytics.pending_requests}
              icon={Clock}
              gradient="from-amber-500 to-orange-600"
            />
            <StatCard
              title="Assigned Requests"
              value={analytics.request_analytics.assigned_requests}
              icon={CheckCircle2}
              gradient="from-green-600 to-green-700"
            />
            <StatCard
              title="Completed Requests"
              value={analytics.request_analytics.completed_requests}
              icon={Users}
              gradient="from-blue-600 to-blue-700"
            />
          </div>
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <RequestVolumeChart data={analytics.request_analytics.monthly_volume} />
            <CompletionRateChart rate={analytics.request_analytics.completion_rate} />
            <DistributionTrendChart
              data={analytics.request_analytics.distribution_trend}
            />
          </div>
        </>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <MonthlyDonationChart data={analytics.monthly_donation_growth} />
        <VerificationRateChart rate={analytics.verification_success_rate} />
        <TopMedicinesBarChart
          data={analytics.most_donated.map((d) => ({
            name: d.name,
            donations: d.donations,
          }))}
          title="Most Donated Medicines"
          dataKey="donations"
        />
        <TopMedicinesBarChart
          data={analytics.most_requested.map((d) => ({
            name: d.name,
            requests: d.requests,
          }))}
          title="Most Requested Medicines"
          dataKey="requests"
        />
        <div className="lg:col-span-2">
          <ExpiryTrendChart data={analytics.expiry_trend} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <DonationsTable data={recentDonations} />
        <RequestsTable data={recentRequests} />
      </div>
    </div>
  );
}
