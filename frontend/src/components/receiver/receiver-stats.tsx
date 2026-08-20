"use client";

import { ClipboardList, Clock, CheckCircle2, Package } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import type { ReceiverRequestStats } from "@/types/api";

export function ReceiverStats({ stats }: { stats: ReceiverRequestStats }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total Requests"
        value={stats.total_requests}
        icon={ClipboardList}
        gradient="from-blue-600 to-blue-700"
        delay={0}
      />
      <StatCard
        title="Pending Requests"
        value={stats.pending_requests}
        icon={Clock}
        gradient="from-amber-500 to-orange-600"
        delay={0.05}
      />
      <StatCard
        title="Approved Requests"
        value={stats.approved_requests}
        icon={Package}
        gradient="from-green-600 to-green-700"
        delay={0.1}
      />
      <StatCard
        title="Completed Requests"
        value={stats.completed_requests}
        icon={CheckCircle2}
        gradient="from-blue-600 to-blue-700"
        delay={0.15}
      />
    </div>
  );
}
