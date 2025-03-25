"use client";

import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/ui/skeleton";

// Lazy load Dashboard component
const Dashboard = dynamic(() => import("@/page/dashboard"), {
  loading: () => <PageSkeleton />,
  ssr: false, // Vì component này có thể yêu cầu quyền truy cập vào DOM
});

export default function Page() {
  return <Dashboard />;
}
