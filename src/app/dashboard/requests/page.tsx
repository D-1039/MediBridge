"use client";

import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { RequestCard } from "@/components/requests/request-card";
import { RequestFilters } from "@/components/requests/request-filters";
import { medicineRequests } from "@/services/mock-data";

type Filter = "all" | "urgent" | "approved" | "pending";

export default function RequestsPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return medicineRequests;
    if (filter === "urgent") return medicineRequests.filter((r) => r.urgency === "urgent");
    return medicineRequests.filter((r) => r.status === filter);
  }, [filter]);

  return (
    <div>
      <DashboardHeader
        title="Medicine Requests"
        subtitle="Patient and NGO requests for essential medicines"
      />
      <div className="mb-6">
        <RequestFilters active={filter} onChange={setFilter} />
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        {filtered.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No requests match this filter.
        </p>
      )}
    </div>
  );
}
