"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/header";
import { RequestCard } from "@/components/requests/request-card";
import { RequestFilters } from "@/components/requests/request-filters";
import { ReceiverStats } from "@/components/receiver/receiver-stats";
import { MedicineSearchPanel } from "@/components/receiver/medicine-search-panel";
import { AvailableMedicinesPanel } from "@/components/receiver/available-medicines-panel";
import { PharmacistRequestCard } from "@/components/pharmacist/pharmacist-request-card";
import { api, ApiError } from "@/lib/api-client";
import { loadRequestsForRole } from "@/lib/load-requests";
import { requestToCard } from "@/lib/mappers";
import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";
import type { ReceiverRequestStats } from "@/types/api";
import { normalizeRequestStatus } from "@/lib/request-utils";

type Filter = "all" | "urgent" | "approved" | "pending";

function requestLoadHint(err: unknown, role?: string): string {
  if (err instanceof ApiError) {
    if (err.code === "NETWORK_ERROR" || err.status === 0) {
      return "Start the backend: cd backend && npm run dev (port 5000)";
    }
    if (err.status === 403) {
      return role === "receiver"
        ? "Please sign in with a receiver account."
        : "This role cannot access requests. Sign out and use the correct demo account.";
    }
    if (err.status === 401) {
      return "Your session has expired. Please sign in again.";
    }
    return err.message;
  }
  return err instanceof Error ? err.message : "Failed to load requests";
}

export default function RequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");
  const [requests, setRequests] = useState<ReturnType<typeof requestToCard>[]>(
    []
  );
  const [rawRequests, setRawRequests] = useState<
    Awaited<ReturnType<typeof loadRequestsForRole>>
  >([]);
  const [medicineQuery, setMedicineQuery] = useState("");
  const [receiverStats, setReceiverStats] = useState<ReceiverRequestStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const isReceiver = user?.role === "receiver";
  const isPharmacist = user?.role === "pharmacist" || user?.role === "admin";

  const canModerate =
    user?.role === "pharmacist" ||
    user?.role === "admin" ||
    user?.role === "donor";

  const load = async () => {
    if (!user?.role) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await loadRequestsForRole(user);
      setRawRequests(data);
      setRequests(data.map(requestToCard));

      if (user.role === "receiver") {
        const stats = await api.myRequestStats();
        setReceiverStats(stats);
      }
    } catch (err) {
      const msg = requestLoadHint(err, user.role);
      toast.error("Failed to load medicine requests", { description: msg });
      setRequests([]);
      setRawRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id, user?.role]);

  const filtered = useMemo(() => {
    if (filter === "all") return requests;
    if (filter === "urgent") return requests.filter((r) => r.urgency === "urgent");
    if (filter === "approved") {
      return requests.filter((r) =>
        ["assigned", "ready_for_collection", "completed", "approved"].includes(
          normalizeRequestStatus(r.status)
        )
      );
    }
    return requests.filter((r) =>
      ["submitted", "under_review", "pending"].includes(
        normalizeRequestStatus(r.status)
      )
    );
  }, [filter, requests]);

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
        title="Medicine Requests"
        subtitle={
          isReceiver
            ? "Search medicines, submit requests, and track status"
            : "Receiver requests for donated medicines"
        }
      />

      {isReceiver && receiverStats && <ReceiverStats stats={receiverStats} />}

      {isReceiver && (
        <div className="space-y-8">
          <AvailableMedicinesPanel onSelectMedicine={setMedicineQuery} />
          <MedicineSearchPanel
            onRequestCreated={load}
            query={medicineQuery}
            onQueryChange={setMedicineQuery}
          />
        </div>
      )}

      {isPharmacist && (
        <div className="mb-6 rounded-xl border border-green-600/30 bg-green-600/10 p-4 text-sm">
          <p className="text-muted-foreground">
            To approve or reject donor uploads, use the{" "}
            <strong>Approve / Reject</strong> page. Manage receiver requests
            here — assign, mark ready, and complete.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-3">
            <Link href="/dashboard/verification">Go to Approve / Reject</Link>
          </Button>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-1">My Requests</h2>
        <p className="text-sm text-muted-foreground">
          {isReceiver
            ? "Track your submitted requests and assigned medicines"
            : "All receiver medicine requests"}
        </p>
      </div>

      <div className="mb-6">
        <RequestFilters active={filter} onChange={setFilter} />
      </div>

      {isPharmacist ? (
        <div className="space-y-6">
          {rawRequests.map((request) => (
            <PharmacistRequestCard
              key={request.id}
              request={request}
              onUpdated={load}
            />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {filtered.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              showTimeline={isReceiver}
              showActions={
                canModerate &&
                ["submitted", "under_review", "pending"].includes(
                  normalizeRequestStatus(request.status)
                )
              }
              onApprove={async (id) => {
                await api.approveRequest(id);
                await load();
              }}
              onReject={async (id) => {
                await api.rejectRequest(id);
                await load();
              }}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 && !isPharmacist && (
        <p className="text-center text-muted-foreground py-12">
          {isReceiver
            ? "No requests yet. Search above to submit a medicine request."
            : "No requests yet. Requests are created when a receiver signs in."}
        </p>
      )}

      {isPharmacist && rawRequests.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No receiver requests yet.
        </p>
      )}
    </div>
  );
}
