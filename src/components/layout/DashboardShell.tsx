"use client";

import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarSkeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 overflow-auto">
        <div className="h-16 border-b px-4 md:px-6 flex items-center">
          <SidebarTrigger />
        </div>
        <div className="p-4 md:p-6 w-full">{children}</div>
      </main>
    </div>
  );
}
