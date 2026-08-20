import type {
  DonationRequestRecord,
  DonationRequestWithMatch,
  MedicineRecord,
} from "@/types/api";
import {
  getRequestStatusLabel,
  getRequestStatusVariant,
  normalizeRequestStatus,
} from "@/lib/request-utils";

export function mapMedicineStatus(status: string): string {
  if (status === "approved" || status === "distributed") return "verified";
  if (status === "rejected") return "rejected";
  return "pending";
}

export function medicineToDonationRow(m: MedicineRecord) {
  return {
    id: m.id,
    name: m.medicine_name || "Unknown",
    donor: m.donor_name || "—",
    quantity: m.quantity,
    status: mapMedicineStatus(m.status),
    date: m.created_at?.slice(0, 10) || "",
  };
}

export function medicineToVerification(m: MedicineRecord) {
  const pending =
    m.status === "pending_pharmacist" || m.status === "manual_review";
  return {
    id: m.id,
    name: m.medicine_name || "Unknown medicine",
    quantity: m.quantity,
    expiryDate: m.expiry_date?.slice(0, 10) || "—",
    category: m.dosage || "General",
    donor: m.donor_name || "Donor",
    status: pending ? "pending" : m.status === "approved" ? "approved" : "rejected",
    image: m.image_url,
    ocrConfidence: Math.round((Number(m.ocr_confidence) || 0) * 100),
  };
}

export function requestToCard(r: DonationRequestRecord | DonationRequestWithMatch) {
  const normalized = normalizeRequestStatus(r.status);
  const urgency: "urgent" | "normal" =
    ["submitted", "under_review", "pending"].includes(normalized)
      ? "urgent"
      : "normal";

  return {
    id: r.id,
    requestCode: r.request_code,
    medicine: r.medicine_name || "Medicine",
    requestedQuantity: r.requested_quantity || 1,
    assignedMedicine: r.assigned_medicine_name,
    assignedQuantity: r.assigned_quantity,
    assignedAt: r.assigned_at,
    urgency,
    requester: r.receiver_name || "Receiver",
    patientInfo: r.receiver_email || "Patient request",
    status: r.status,
    statusLabel: getRequestStatusLabel(r.status),
    statusVariant: getRequestStatusVariant(r.status),
    location: "—",
    date: r.created_at?.slice(0, 10) || "",
    updatedAt: r.updated_at || r.created_at,
    statusHistory: r.status_history || [],
    smart_match:
      "smart_match" in r ? r.smart_match ?? null : null,
  };
}
