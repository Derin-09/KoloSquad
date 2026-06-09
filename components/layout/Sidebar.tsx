"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { sidebarNavItems } from "@/components/usenav";
import { useJoinSquadModalStore } from "@/stores/join-squad-modal-store";

export default function Sidebar() {
  const pathname = usePathname();
  const isSquadsOpenByDefault = useMemo(
    () => pathname?.startsWith("/squads") ?? false,
    [pathname]
  );
  const [isSquadsOpen, setIsSquadsOpen] = useState(isSquadsOpenByDefault);
  const openJoinSquadModal = useJoinSquadModalStore((state) => state.open);

  useEffect(() => {
    if (pathname?.startsWith("/squads")) {
      setIsSquadsOpen(true);
    }
  }, [pathname]);

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 gap-2 p-3 sticky top-0 h-dvh bg-[#1d1333] text-white">
<div className="px-2 py-3"><Logo className="h-6" variant="dark" /></div>
      <nav className="flex-1 space-y-1">
        {sidebarNavItems.map((n) => {
          const active = pathname?.startsWith(n.href);
          const Icon = n.icon;

          if (n.children?.length) {
            return (
              <div key={n.href} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setIsSquadsOpen((prev) => !prev)}
                  className={clsx(
                    "w-full flex items-center justify-between rounded-md px-3 py-2",
                    active ? "bg-muted text-foreground" : "hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={18} />
                    <span className="text-sm">{n.label}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={clsx("transition-transform", isSquadsOpen && "rotate-180")}
                  />
                </button>

                {isSquadsOpen && (
                  <div className="ml-9 space-y-1">
                    {n.children.map((child) => {
                      const childActive = pathname === child.href || pathname?.startsWith(`${child.href}/`);
                      const isJoinSquad = child.href === "/squads/join";

                      if (isJoinSquad) {
                        return (
                          <button
                            key={child.href}
                            type="button"
                            onClick={openJoinSquadModal}
                            className={clsx(
                              "block w-full rounded-md px-3 py-2 text-left text-sm",
                              "hover:bg-muted hover:text-foreground"
                            )}
                          >
                            {child.label}
                          </button>
                        );
                      }

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={clsx(
                            "block rounded-md px-3 py-2 text-sm",
                            childActive ? "text-accent" : "hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                "flex items-center gap-2 rounded-md px-3 py-2",
                active ? "bg-muted text-foreground" : "hover:bg-muted hover:text-foreground"
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
