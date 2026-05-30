import { DashboardHeader } from "@/components/dashboard/header";
import { MedicineUploadForm } from "@/components/upload/medicine-upload-form";

export default function UploadPage() {
  return (
    <div>
      <DashboardHeader
        title="Upload Medicine"
        subtitle="Donate unused medicines for safe redistribution"
      />
      <MedicineUploadForm />
    </div>
  );
}
