"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";




export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = pathname === "/sign-in"
    || pathname === "/sign-up"
    || (pathname?.startsWith("/reset-password") ?? false)
    || (pathname?.startsWith("/onboarding") ?? false);

  if (isStandalone) {
    return <main className="min-h-dvh p-3 md:p-6 lg:p-8">{children}</main>;
  }

  return (
    <div className="min-h-dvh flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 min-w-0 p-3 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
