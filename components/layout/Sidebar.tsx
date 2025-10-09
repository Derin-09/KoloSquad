"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wallet, Banknote, Settings } from "lucide-react";
import { clsx } from "clsx";
import { Logo } from "@/components/Logo";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/squads/new", label: "Squads", icon: Users },
  { href: "/contributions", label: "Contributions", icon: Wallet },
  { href: "/payouts", label: "Payouts", icon: Banknote },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 gap-2 p-3 sticky top-0 h-dvh">
      <div className="px-2 py-3"><Logo className="h-6" variant="dark" /></div>
      <nav className="flex-1 space-y-1">
        {nav.map((n) => {
          const active = pathname?.startsWith(n.href);
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                "flex items-center gap-2 rounded-md px-3 py-2",
                active ? "bg-[color:var(--muted)]" : "hover:bg-[color:var(--muted)]"
              )}
            >
              <Icon size={18} />
              <span className="text-sm">{n.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-2 text-xs opacity-70">Save together. Flex together.</div>
    </aside>
  );
}
