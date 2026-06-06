import { api, ApiError } from "@/lib/api-client";
import type { ApiUser, DonationRequestRecord } from "@/types/api";

function asRequestList(data: unknown): DonationRequestRecord[] {
  return Array.isArray(data) ? data : [];
}

/** Load donation requests allowed for the signed-in role. */
export async function loadRequestsForRole(
  user: ApiUser
): Promise<DonationRequestRecord[]> {
  if (!user?.role) return [];

  if (user.role === "receiver") {
    return asRequestList(await api.myRequests());
  }

  if (
    user.role === "pharmacist" ||
    user.role === "admin" ||
    user.role === "donor"
  ) {
    try {
      return asRequestList(await api.listRequests(true));
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        throw err;
      }
      return asRequestList(await api.listRequests(false));
    }
  }

  return [];
}
