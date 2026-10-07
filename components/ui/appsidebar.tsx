"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Users,
  LogOut,
  Receipt,
  CreditCard,
  PieChart,
  FileText,
  Settings,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";

interface MenuItem {
  title: string;
  icon: LucideIcon;
  path: string;
  roles?: string[]; 
}

interface MenuGroup {
  label: string;
  roles?: string[]; 
  items: MenuItem[];
}


const menuGroups: MenuGroup[] = [
  {
    label: "Main",
    roles: ["admin"], 
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "",
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Finance Management",
    roles: ["admin", "finance"], 
    items: [
      {
        title: "Transactions",
        icon: Receipt,
        path: "/transactions",
      },
      {
        title: "Financial Reports",
        icon: PieChart,
        path: "/reports",
        roles: ["finance"],
      },
    ],
  },
  {
    label: "People & role",
    roles: ["admin"],
    items: [
      {
        title: "Users",
        icon: Users,
        path: "/users",
      },
    ],
  },
  {
    label: "Content Management",
    roles: ["admin", "editor"],
    items: [
      {
        title: "Articles",
        icon: FileText,
        path: "/articles",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        icon: Settings,
        path: "/settings",
      },
    ],
  },
];

export function AppSidebar({ basePath }: { basePath?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, role } = useAuth();


  const currentBasePath = basePath || `/dashboard/${role || ""}`;

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const hasAccess = (allowedRoles?: string[]) => {
    if (!allowedRoles) return true; 
    return role ? allowedRoles.includes(role) : false;
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex-col mt-[10px] px-2">
          <p className="text-4xl tracking-tight text-[#428fdb] bitcount">
            K-WAY
          </p>
          <p className="text-[#234a87]">Content management system</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuGroups
          .filter((group) => hasAccess(group.roles)) 
          .map((group) => {
            const visibleItems = group.items.filter((item) =>
              hasAccess(item.roles),
            );

            if (visibleItems.length === 0) return null;

            return (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleItems.map((item) => {
                      const targetUrl = `${currentBasePath}${item.path}`;
                      const isActive = pathname === targetUrl;

                      return (
                        <SidebarMenuItem key={item.title}>
                          <Link href={targetUrl} className="w-full">
                            <SidebarMenuButton
                              isActive={isActive}
                              className="cursor-pointer"
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.title}</span>
                            </SidebarMenuButton>
                          </Link>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          {/* User Info & Role Badge */}
          {user?.email && (
            <SidebarMenuItem>
              <div className="px-2 py-1 flex flex-col">
                <span className="text-xs text-slate-500 truncate">
                  {user.email}
                </span>
                {role && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Role: {role}
                  </span>
                )}
              </div>
            </SidebarMenuItem>
          )}

          {/* Logout Button */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="cursor-pointer text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:hover:bg-red-950/20 font-medium w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Copyright notice */}
          <SidebarMenuItem>
            <div className="px-2 pt-2 text-[10px] text-slate-400">
              © 2026 all rights reserved
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
