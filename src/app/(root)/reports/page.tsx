"use client";

import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/ui/skeleton";

// Lazy load Reports component
const Reports = dynamic(() => import("@/page/reports"), {
  loading: () => <PageSkeleton />,
  ssr: false, // Vì component này có thể yêu cầu quyền truy cập vào DOM
});

export default function Page() {
  return <Reports />;
}
