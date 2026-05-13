"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  Circle,
  LayoutGrid,
  X,
  LayoutDashboard,
  Users,
  Wallet,
  Banknote,
  Settings,
  Medal,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { supabase } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Logo } from "../Logo";
import Image from "next/image";
import { data } from "framer-motion/client";
import { useAuthStore } from "@/stores/auth-store";

const mobileNavItems = [
  { text: "Dashboard", logo: LayoutDashboard, link: "/dashboard" },
  { text: "Squads", logo: Users, link: "/squads" },
  { text: "Contributions", logo: Wallet, link: "/contributions" },
  { text: "Payouts", logo: Banknote, link: "/payouts" },
  { text: "Leaderboard", logo: Medal, link: "/leaderboard" },
  { text: "Settings", logo: Settings, link: "/settings" },
  // { text: "Notifications", logo: Bell, link: "/notifications" },
];

export default function Topbar() {
  const [isClicked, setIsClicked] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [squadId, setSquadId] = useState('')
  const [confirmId, setConfirmId] = useState('')
  const [name, setName] = useState('')
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) || []
  const data = useAuthStore((state) => state.user)



  
useEffect(() => {
  const fetchSquadName = async () => {
    const match = pathname.match(/^\/squads\/([^\/]+)/);
    if (!match) return;

    const id = match[1];
    const { data, error } = await supabase
      .from("squads")
      .select("name")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Failed to fetch squad:", error.message);
      return;
    }

    setName(data.name);
  };

  fetchSquadName();
}, [pathname]);



 

  const segmentLabels: Record<string, string> = {
    'contribution-plans': 'Contribution Plan'
    // payroll: "Payroll",
    // adhoc: "Adhoc Payroll",
    // dashboard: "Dashboard",
    // requestLeave: "Request Leave",
    // myRequests: "My Requests",
    // leaveBalance: 'Leave Balance',
    // leaveApproval: 'Leave Approvals',
    // loan: "Loan",
  }


  // const breadcrumbs =
  //   segments.length === 0
  //     ? ["Dashboard"]
  //     : segments.map((seg) => segmentLabels[seg] || seg)

const breadcrumbs = segments.map((seg, idx) => {
  if (segments[0] === "squads" && idx === 1 && name) {
    return name; // replace ID with actual name
  }
  return segmentLabels[seg] || seg;
});



  useEffect(() => {
    const getUserAvatar = async () => {
      // const { data } = await supabase.auth.getUser();
      const user = data
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }
    };

    getUserAvatar();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUserAvatar();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [data]);

  return (
    <header className="sticky top-0 z-30 bg-[color:var(--background)]/80 backdrop-blur-md border-b border-[color:var(--border)]">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:float-riht w-full">
        {/* Left section - brand or trigger */}
        <div className="flex md:hidden items-center gap-3">
          <Logo className="h-6" variant="auto" />
        </div>


        {/* Middle - search (optional later) */}
        

          <div className="hidden md:flex gap-2 items-center">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1
              return (
                <React.Fragment key={idx}>
                  <p
                    className={`capitalize ${isLast ? 'text-foreground font-semibold' : ''
                      }`}
                  >
                    {crumb}
                  </p>
                  {idx < breadcrumbs.length - 1 && <ChevronRight size={16} />}
                </React.Fragment>
              )
            })}
          </div>

        {/* Right - controls */}
        
          <div className="flex items-center gap-1 md:gap-3 ">
            <span className="hidden sm:inline-flex items-center text-center gap-1 text-xs badge-soft">
              <Circle size={8} fill="currentColor" /> Live
            </span>
            
            <ThemeToggle variant="icon" />

            <button
              className="rounded-md p-2 hover:bg-[color:var(--muted)] transition"
              aria-label="Notifications"
              onClick={() => router.push("/notifications")}
            >
              <Bell size={18} />
            </button>

            <button
              onClick={() => router.push("/settings")}
              className="w-8 h-8 rounded-full overflow-hidden border border-[color:var(--border)] hover:opacity-80 transition"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User avatar"
                  // fill
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[color:var(--accent)]" />
              )}
            </button>


            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded-md hover:bg-[color:var(--muted)] transition"
                onClick={() => setIsClicked(true)}
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>

      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {isClicked && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35 }}
            className="fixed inset-0 z-50 bg-[color:var(--background)] h-screen md:hidden"
          >
            <div className="flex justify-between items-center p-4">
              <div className="">
                <Logo className="h-6" variant="auto" />
              </div>
              <button
                onClick={() => setIsClicked(false)}
                className="p-2 rounded-md hover:bg-[color:var(--muted)] transition"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex flex-col gap-6 px-8 pt-8 text-lg font-medium bg-[color:var(--background)]">
              {mobileNavItems.map((item, idx) => {
                const Icon = item.logo;
                const active = pathname.startsWith(item.link);
                return (
                  <Link
                    key={idx}
                    href={item.link}
                    onClick={() => setIsClicked(false)}
                    className={`flex items-center gap-3 transition ${active
                        ? "text-[color:var(--accent)]"
                        : "hover:text-[color:var(--accent-foreground)]"
                      }`}
                  >
                    <Icon size={22} />
                    {item.text}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


