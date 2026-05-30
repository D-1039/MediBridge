"use client";

import { Pill, Clock, Building2, TrendingDown } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DonationsChart, WasteReductionChart } from "@/components/dashboard/charts";
import { DonationsTable, RequestsTable } from "@/components/dashboard/data-table";
import {
  dashboardStats,
  recentDonations,
  pendingRequests,
} from "@/services/mock-data";

export default function DashboardPage() {
  return (
    <div>
      <DashboardHeader
        title="Dashboard"
        subtitle="Overview of medicine redistribution impact"
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Medicines Saved"
          value={dashboardStats.medicinesSaved.toLocaleString()}
          change="+12% this month"
          icon={Pill}
          gradient="from-sky-500 to-blue-600"
          delay={0}
        />
        <StatCard
          title="Pending Verification"
          value={dashboardStats.pendingVerification}
          change="5 urgent"
          icon={Clock}
          gradient="from-amber-500 to-orange-600"
          delay={0.1}
        />
        <StatCard
          title="Active NGOs"
          value={dashboardStats.activeNgos}
          change="+3 new partners"
          icon={Building2}
          gradient="from-teal-500 to-cyan-600"
          delay={0.2}
        />
        <StatCard
          title="Waste Reduction"
          value={`${dashboardStats.wasteReduction}%`}
          change="+8% vs last quarter"
          icon={TrendingDown}
          gradient="from-emerald-500 to-green-600"
          delay={0.3}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <DonationsChart />
        <WasteReductionChart />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <DonationsTable data={recentDonations} />
        <RequestsTable data={pendingRequests} />
      </div>
    </div>
  );
}
