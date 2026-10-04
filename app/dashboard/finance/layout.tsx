"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (role !== "finance") {
        router.replace(`/dashboard/${role}/`);
      }
    }
  }, [user, role, loading, router]);

  if (loading || !user || role !== "finance") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Verifying permissions...</p>
      </div>
    );
  }

  return <>{children}</>;
}
