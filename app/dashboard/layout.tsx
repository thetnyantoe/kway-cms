"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/appsidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar basePath="/dashboard/admin" />

        <main className="flex-1 overflow-x-hidden p-2 md:p-4">
          <header className="flex items-center gap-2 mb-4">
            {" "}
            <SidebarTrigger className="cursor-pointer" />
          </header>

          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
