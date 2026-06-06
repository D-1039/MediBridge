import { redirect } from "next/navigation";

/** Shortcut URL → pharmacist approval queue */
export default function PharmacistPortalPage() {
  redirect("/dashboard/verification");
}
