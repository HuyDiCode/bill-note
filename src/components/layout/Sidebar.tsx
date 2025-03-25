"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Sun, Moon, Monitor, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@/hooks/useUser";
import { mainRoutes, utilityRoutes, isRouteActive } from "@/config/routes";
import {
  Sidebar as SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, fetchUser, logout, getInitials } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRoutes, setFilteredRoutes] = useState(mainRoutes);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Cập nhật danh sách routes khi searchQuery thay đổi
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRoutes(mainRoutes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = mainRoutes.filter(
      (route) =>
        route.title.toLowerCase().includes(query) ||
        route.description?.toLowerCase().includes(query)
    );
    setFilteredRoutes(filtered);
  }, [searchQuery]);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      router.push("/login");
    }
  };

  return (
    <SidebarRoot>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 px-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url || ""} />
                <AvatarFallback>
                  {getInitials(user?.name || user?.email || "UN")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">
                  {user?.name || user?.email?.split("@")[0]}
                </p>
                {user?.name && user?.email && (
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center">
                {theme === "dark" ? (
                  <Moon className="mr-2 h-4 w-4" />
                ) : theme === "light" ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Monitor className="mr-2 h-4 w-4" />
                )}
                <span>Giao diện</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(value) =>
                    setTheme(value as "light" | "dark" | "system")
                  }
                >
                  <DropdownMenuRadioItem
                    value="light"
                    className="flex items-center"
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Sáng</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="dark"
                    className="flex items-center"
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Tối</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="system"
                    className="flex items-center"
                  >
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>Hệ thống</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center text-red-500 focus:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-sidebar-accent border border-sidebar-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
          />
          <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>F
          </kbd>
        </div>
      </div>

      {/* Navigation */}
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarMenu>
            {filteredRoutes.map((route) => {
              const RouteIcon = route.icon;
              const isActive = isRouteActive(pathname, route.path);

              return (
                <SidebarMenuItem key={route.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={route.description}
                  >
                    <Link
                      href={route.path}
                      className="flex items-center w-full"
                    >
                      <RouteIcon className="h-4 w-4 mr-3" />
                      {route.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Utility Routes */}
        {utilityRoutes.length > 0 && (
          <>
            <SidebarSeparator className="my-4" />
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tiện ích
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {utilityRoutes.map((route) => {
                    const RouteIcon = route.icon;
                    const isActive = isRouteActive(pathname, route.path);

                    return (
                      <SidebarMenuItem key={route.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={route.description}
                        >
                          <Link
                            href={route.path}
                            className="flex items-center w-full"
                          >
                            <RouteIcon className="h-4 w-4 mr-3" />
                            {route.title}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </SidebarRoot>
  );
}
