import {
  LayoutDashboard,
  CreditCard,
  Calendar,
  Settings,
  PieChart,
  Users,
  Receipt,
} from "lucide-react";

export interface RouteConfig {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: RouteConfig[];
  description?: string;
}

export const mainRoutes: RouteConfig[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    description: "Tổng quan về tài chính cá nhân",
  },
  {
    title: "Chi Tiêu",
    path: "/expenses",
    icon: CreditCard,
    description: "Quản lý chi tiêu của bạn",
  },
  {
    title: "Hóa Đơn",
    path: "/bills",
    icon: Receipt,
    description: "Theo dõi và thanh toán hóa đơn",
  },
  {
    title: "Chia Sẻ",
    path: "/sharing",
    icon: Users,
    description: "Chia sẻ và quản lý chi phí nhóm",
  },
  {
    title: "Lịch",
    path: "/calendar",
    icon: Calendar,
    description: "Lịch chi tiêu và thu nhập",
  },
  {
    title: "Báo Cáo",
    path: "/reports",
    icon: PieChart,
    description: "Phân tích chi tiêu và báo cáo",
  },
];

export const utilityRoutes: RouteConfig[] = [
  {
    title: "Cài Đặt",
    path: "/settings",
    icon: Settings,
    description: "Tùy chỉnh ứng dụng",
  },
];

// Tất cả các route trong một mảng phẳng (để tìm kiếm)
export const allRoutes: RouteConfig[] = [...mainRoutes, ...utilityRoutes];

// Hàm lấy route theo path
export function getRouteByPath(path: string): RouteConfig | undefined {
  return allRoutes.find((route) => route.path === path);
}

// Hàm kiểm tra route active
export function isRouteActive(currentPath: string, routePath: string): boolean {
  // Kiểm tra chính xác hoặc con của route
  return currentPath === routePath || currentPath.startsWith(`${routePath}/`);
}
