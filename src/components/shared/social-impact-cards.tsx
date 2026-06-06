"use client";

import { Heart, Leaf, IndianRupee, Pill } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import type { ImpactMetrics } from "@/components/shared/impact-banner";

export function SocialImpactCards({ metrics }: { metrics: ImpactMetrics }) {
  const costLabel =
    metrics.cost_saved_inr >= 100000
      ? `₹${(metrics.cost_saved_inr / 100000).toFixed(1)}L`
      : `₹${Math.round(metrics.cost_saved_inr / 1000)}K`;

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Medicines Rescued"
        value={metrics.medicines_rescued.toLocaleString()}
        change="Verified & distributed"
        icon={Pill}
        gradient="from-sky-500 to-blue-600"
        delay={0}
      />
      <StatCard
        title="Patients Helped"
        value={metrics.patients_helped.toLocaleString()}
        change="Completed requests"
        icon={Heart}
        gradient="from-rose-500 to-pink-600"
        delay={0.05}
      />
      <StatCard
        title="Waste Prevented"
        value={`${metrics.waste_prevented_kg} Kg`}
        change="Diverted from landfill"
        icon={Leaf}
        gradient="from-emerald-500 to-green-600"
        delay={0.1}
      />
      <StatCard
        title="Cost Saved"
        value={costLabel}
        change="Estimated INR value"
        icon={IndianRupee}
        gradient="from-amber-500 to-orange-600"
        delay={0.15}
      />
    </div>
  );
}
