import { AuthProvider } from "@/contexts/auth-provider";
import { DashboardGuard } from "@/components/dashboard/dashboard-guard";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardGuard>
        <div className="flex min-h-screen bg-background">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0">
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
          <MobileNav />
        </div>
      </DashboardGuard>
    </AuthProvider>
  );
}
