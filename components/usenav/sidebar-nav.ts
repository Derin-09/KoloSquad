import { Banknote, LayoutDashboard, Medal, Settings, Users, Wallet } from "lucide-react";
import type { ComponentType } from "react";

export type SidebarNavLeafItem = {
  href: string;
  label: string;
};

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  children?: SidebarNavLeafItem[];
};

export const sidebarNavItems: SidebarNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/squads",
    label: "Squads",
    icon: Users,
    children: [
      { href: "/squads", label: "Your Squads" },
      { href: "/squads/new/step-one", label: "Create Squad" },
      { href: "/squads/join", label: "Join Squad" },
    ],
  },
  { href: "/contribution-plans", label: "Contributions", icon: Wallet },
  { href: "/payouts", label: "Payouts", icon: Banknote },
  { href: "/leaderboard", label: "Leaderboard", icon: Medal },
  { href: "/settings", label: "Settings", icon: Settings },
];
