import { DashboardShell } from "@/components/layout/DashboardShell";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata = {
  title: "Bill Note - Quản lý chi tiêu",
  description: "Ứng dụng theo dõi và quản lý chi tiêu hiện đại",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardShell>{children}</DashboardShell>
    </SidebarProvider>
  );
}
