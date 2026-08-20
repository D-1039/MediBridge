export const REQUEST_STATUS_FLOW = [
  "submitted",
  "under_review",
  "assigned",
  "ready_for_collection",
  "completed",
] as const;

export function normalizeRequestStatus(status: string): string {
  if (status === "pending") return "submitted";
  if (status === "approved") return "assigned";
  return status;
}

export function getRequestStatusLabel(status: string): string {
  const normalized = normalizeRequestStatus(status);
  const labels: Record<string, string> = {
    submitted: "Submitted",
    under_review: "Under Review",
    assigned: "Assigned By Pharmacist",
    ready_for_collection: "Ready For Collection",
    completed: "Distribution Completed",
    rejected: "Rejected",
  };
  return labels[normalized] || status;
}

export function getRequestStatusVariant(
  status: string
): "warning" | "success" | "secondary" | "urgent" | "default" {
  const normalized = normalizeRequestStatus(status);
  if (normalized === "completed") return "success";
  if (normalized === "rejected") return "urgent";
  if (normalized === "ready_for_collection") return "success";
  if (normalized === "assigned") return "default";
  if (normalized === "under_review") return "warning";
  return "warning";
}

export function isPendingRequestStatus(status: string): boolean {
  const normalized = normalizeRequestStatus(status);
  return ["submitted", "under_review"].includes(normalized);
}
