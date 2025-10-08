"use client";

import { Bell, Circle } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-10 bg-[color:var(--background)]/80 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--background)]/80">
      <div className="flex items-center gap-3 py-3 px-3 md:px-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex-1">
          <input
            className="w-full md:w-96 rounded-md border px-3 py-2 bg-[color:var(--surface)]"
            style={{ borderColor: "var(--border)" }}
            placeholder="Search"
          />
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle variant="icon" />
          <span className="badge-soft inline-flex items-center gap-1"><Circle size={8} fill="currentColor"/> Live</span>
          <button className="rounded-md p-2 hover:bg-[color:var(--muted)]" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <div className="w-8 h-8 rounded-full bg-[color:var(--accent)]" />
        </div>
      </div>
    </header>
  );
}
