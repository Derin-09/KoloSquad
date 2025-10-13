"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { supabase } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Logo } from "../Logo";

const mobileNavItems = [
  { text: "Dashboard", logo: LayoutDashboard, link: "/dashboard" },
  { text: "Squads", logo: Users, link: "/squads/new" },
  { text: "Contributions", logo: Wallet, link: "/contributions" },
  { text: "Payouts", logo: Banknote, link: "/payouts" },
  { text: "Leaderboard", logo: Medal, link: "/leaderboard" },
  { text: "Settings", logo: Settings, link: "/settings" },
  { text: "Notifications", logo: Bell, link: "/notifications" },
];

export default function Topbar() {
  const [isClicked, setIsClicked] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch avatar on mount + refresh when auth state changes
  useEffect(() => {
    const getUserAvatar = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
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
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[color:var(--background)]/80 backdrop-blur-md border-b border-[color:var(--border)]">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:float-right">
        {/* Left section - brand or trigger */}
        <div className="flex md:hidden items-center gap-3">
            <Logo className="h-6" variant="auto" />
        </div>

      
        {/* Middle - search (optional later) */}
        <div className="hidden md:fle flex-1 justify-center">
          <input
            className="w-80 rounded-md border px-3 py-2 text-sm bg-[color:var(--surface)] placeholder:text-[color:var(--muted-foreground)]"
            style={{ borderColor: "var(--border)" }}
            placeholder="Search"
          />
        </div>

        {/* Right - controls */}
        <div className="flex items-center gap-1 md:gap-3 ">
          <ThemeToggle variant="icon" />
          <span className="hidden sm:inline-flex items-center gap-1 text-xs badge-soft">
            <Circle size={8} fill="currentColor" /> Live
          </span>

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
                    className={`flex items-center gap-3 transition ${
                      active
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












// "use client";

// import { useEffect, useState } from "react";
// import { Bell, Circle, LayoutGrid, X } from "lucide-react";
// import { LayoutDashboard, Users, Wallet, Banknote, Settings, Medal } from "lucide-react";
// import { ThemeToggle } from "@/components/ui/ThemeToggle";
// import { supabase } from "@/lib/supabase/client";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";

// const mobileNavItems = [
//     {
//         text: "Dashboard",
//         logo: LayoutDashboard,
//         altText: "Dashboard",
//         link: "/dashboard",
//     },
//     {
//         text: "Squad",
//         logo: Users,
//         altText: "Squad",
//         link: "/squads",
//     },
//     {
//         text: "Contributions",
//         logo: Wallet,
//         altText: "Contributions",
//         link: "/contributions",
//     },
//     {
//         text: "Payouts",
//         logo: Banknote,
//         altText: "Payouts",
//         link: "/payouts",
//     },
//     {
//         text: "Leaderboard",
//         logo: Medal,
//         altText: "Leaderboard",
//         link: "/leaderboard",
//     },
    
//     {
//         text: "Settings",
//         logo: Settings,
//         altText: "Settings",
//         link: "/settings",
//     },
//     {
//         text: "Notifications",
//         logo: Bell,
//         altText: "Notifications",
//         link: "",
//     },
// ];

// export default function Topbar() {
//   const [isClicked, setIsClicked] = useState(false)
//   const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     (async () => {
//       const { data } = await supabase.auth.getUser();
//       const user = data.user;
//       if (user?.user_metadata?.avatar_url) {
//         setAvatarUrl(user.user_metadata.avatar_url);
//       }
//     })();
//   }, []);

//   return (
//     <header className="sticky top-0 z-10 bg-[color:var(--background)]/80 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--background)]/80">
//       <div
//         className="flex items-center gap-3 py-3 px-3 md:px-5 border-b"
//         style={{ borderColor: "var(--border)" }}
//       >
//         <div className="flex-1 hidden">
//           <input
//             className="w-full md:w-96 rounded-md border px-3 py-2 bg-[color:var(--surface)]"
//             style={{ borderColor: "var(--border)" }}
//             placeholder="Search"
//           />
//         </div>

//         <div className="hidden sm:flex items-center gap-3">
//           <ThemeToggle variant="icon" />
//           <span className="badge-soft inline-flex items-center gap-1">
//             <Circle size={8} fill="currentColor" /> Live
//           </span>
//           <button
//             className="rounded-md p-2 hover:bg-[color:var(--muted)]"
//             aria-label="Notifications"
//           >
//             <Bell size={18} />
//           </button>

//           <button
//             onClick={() => router.push("/settings")}
//             className="w-8 h-8 rounded-full overflow-hidden border border-[color:var(--border)] hover:cursor-pointer hover:opacity-80 transition"
//           >
//             {avatarUrl ? (
//               <img
//                 src={avatarUrl}
//                 alt="User avatar"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="w-full h-full bg-[color:var(--accent)]" />
//             )}
//           </button>
//         </div>
//       </div>
      





// {/* {Mobile nav} */}

//       <div>
//         <div className="md:hidden" onClick={() => setIsClicked(!isClicked)}>
//           <LayoutGrid />
//         </div>
//         <AnimatePresence>
//           {isClicked && (
//             <motion.div
//               initial={{ x: "100%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "100%" }}
//               transition={{ type: "tween", duration: 0.4 }}
//               className="fixed inset-0 z-50"
//             >
//               <nav className="flex flex-col md:hidden gap-[10%] p-6 pt-10 w-screen h-screen bg-[#111015]">
//                 <div className="pl-2" onClick={() => setIsClicked(false)}>
//                   <X />
//                 </div>
//                 <section className="flex flex-col gap-10  h-full text-white">
//                    {mobileNavItems.map((item, idx) => {
//                                         const Icon = item.logo
//                                         return (
//                                             <div onClick={() => setIsClicked(false)} key={idx}>
//                                                 <Link href={item.link}>
//                                                     <div className="flex  gap-3 items-center justify-cente ">
//                                                         <Icon />
//                                                         <p className="text-[24px] ">{item.text}</p>
//                                                     </div>
//                                                 </Link>
//                                             </div>
//                                         )
//                                     })}
//                 </section>
//               </nav>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </header>
//   );
// }









// "use client";

// import { Bell, Circle } from "lucide-react";
// import { ThemeToggle } from "@/components/ui/ThemeToggle";

// export default function Topbar() {
//   return (
//     <header className="sticky top-0 z-10 bg-[color:var(--background)]/80 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--background)]/80">
//       <div className="flex items-center gap-3 py-3 px-3 md:px-5 border-b" style={{ borderColor: "var(--border)" }}>
//         <div className="flex-1">
//           <input
//             className="w-full md:w-96 rounded-md border px-3 py-2 bg-[color:var(--surface)]"
//             style={{ borderColor: "var(--border)" }}
//             placeholder="Search"
//           />
//         </div>
//         <div className="hidden sm:flex items-center gap-3">
//           <ThemeToggle variant="icon" />
//           <span className="badge-soft inline-flex items-center gap-1"><Circle size={8} fill="currentColor"/> Live</span>
//           <button className="rounded-md p-2 hover:bg-[color:var(--muted)]" aria-label="Notifications">
//             <Bell size={18} />
//           </button>
//           <div className="w-8 h-8 rounded-full bg-[color:var(--accent)]" />
//         </div>
//       </div>
//     </header>
//   );
// }
