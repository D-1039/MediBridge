import type { UserRole } from "@/types/api";

/** Where each role lands after login */
export function getHomePathForRole(role: UserRole): string {
  switch (role) {
    case "pharmacist":
      return "/dashboard/verification";
    case "admin":
      return "/dashboard/admin";
    case "receiver":
      return "/dashboard/requests";
    case "donor":
    default:
      return "/dashboard";
  }
}

export const DEMO_ACCOUNTS = [
  {
    role: "Pharmacist",
    key: "pharmacist" as const,
    email: "pharmacist@medibridge.health",
    password: "password123",
    description: "Approve / reject donated medicines",
    path: "/dashboard/verification",
  },
  {
    role: "Admin",
    key: "admin" as const,
    email: "admin@medibridge.health",
    password: "password123",
    description: "Analytics & admin panel",
    path: "/dashboard/admin",
  },
  {
    role: "Donor",
    key: "donor" as const,
    email: "donor@medibridge.health",
    password: "password123",
    description: "Upload medicine strips",
    path: "/dashboard/upload",
  },
  {
    role: "Receiver",
    key: "receiver" as const,
    email: "receiver@medibridge.health",
    password: "password123",
    description: "Request medicines",
    path: "/dashboard/requests",
  },
] as const;
