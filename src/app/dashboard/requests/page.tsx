"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/header";
import { RequestCard } from "@/components/requests/request-card";
import { RequestFilters } from "@/components/requests/request-filters";
import { api, ApiError } from "@/lib/api-client";
import { loadRequestsForRole } from "@/lib/load-requests";
import { requestToCard } from "@/lib/mappers";
import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";

type Filter = "all" | "urgent" | "approved" | "pending";

function requestLoadHint(err: unknown, role?: string): string {
  if (err instanceof ApiError) {
    if (err.code === "NETWORK_ERROR" || err.status === 0) {
      return "Backend chalao: cd backend && npm run dev (port 5000)";
    }
    if (err.status === 403) {
      return role === "receiver"
        ? "Receiver account se login karo."
        : "Is role ke liye requests allowed nahi. Logout karke sahi demo account use karo.";
    }
    if (err.status === 401) {
      return "Session expire ho gaya. Dobara login karo.";
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
  const [loading, setLoading] = useState(true);

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
      setRequests(data.map(requestToCard));
    } catch (err) {
      const msg = requestLoadHint(err, user.role);
      toast.error("Failed to load medicine requests", { description: msg });
      setRequests([]);
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
    return requests.filter((r) => r.status === filter);
  }, [filter, requests]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title="Medicine Requests"
        subtitle={
          user?.role === "receiver"
            ? "Your medicine requests"
            : "Receiver requests for donated medicines"
        }
      />

      {(user?.role === "pharmacist" || user?.role === "admin") && (
        <div className="mb-6 rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 text-sm">
          <p className="text-muted-foreground">
            Donor uploads approve/reject karne ke liye{" "}
            <strong>Approve / Reject</strong> page use karo — yahan sirf receiver
            ki medicine requests dikhti hain.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-3">
            <Link href="/dashboard/verification">Go to Approve / Reject</Link>
          </Button>
        </div>
      )}

      <div className="mb-6">
        <RequestFilters active={filter} onChange={setFilter} />
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        {filtered.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            showActions={canModerate && request.status === "pending"}
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
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          {user?.role === "receiver"
            ? "Abhi koi request nahi. Pehle approved medicine choose karke request banao."
            : "No requests yet. Receiver login se request create hoti hai."}
        </p>
      )}
    </div>
  );
}
