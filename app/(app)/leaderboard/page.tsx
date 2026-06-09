"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Squad {
  id: string;
  name: string;
  target_amount: number;
  member_count: number;
  contributions?: { amount: number; status: string | number }[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function LeaderboardPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("squads")
          .select("id, name, target_amount, member_count, contributions:contributions(amount,status)")
          .order("target_amount", { ascending: false });

        if (error) throw error;

        setSquads((data || []).map((s) => ({
          id: s.id,
          name: s.name,
          target_amount: Number(s.target_amount || 0),
          member_count: Number(s.member_count || 0) || 8,
          contributions: s.contributions,
        })));
      } catch {
        setSquads([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const displaySquads = squads.length ? squads.slice(0, 3) : [
    { id: "alpha-squad", name: "Alpha Squad", target_amount: 12450000, member_count: 12 },
    { id: "tech-titans", name: "Tech Titans", target_amount: 4200500, member_count: 8 },
    { id: "prosperity-hub", name: "Prosperity Hub", target_amount: 8910000, member_count: 10 },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-white">
      <div className="rounded-4xl border border-[#1f2a3d] bg-[#08111b]/90 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[#82c9f0]">Select a Squad</p>
            <h1 className="mt-3 text-4xl font-semibold">View payouts and rankings for your active groups.</h1>
          </div>
          <div className="rounded-3xl border border-[#25344f] bg-[#0e1b2f] px-5 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#c8d7f0]">Featured</p>
                <p className="text-xs uppercase tracking-[0.24em] text-[#7d9fc2]">Global Leaderboard</p>
              </div>
              <div className="rounded-full bg-[#1f3a52] px-4 py-2 text-xs text-[#92c9eb]">1.5% APY Boost</div>
            </div>
            <p className="mt-3 text-sm text-[#8da9cb]">Compete with all Kolosquad savers worldwide.</p>
            <Link href="/leaderboard" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#91d7ec] px-4 py-3 text-sm font-semibold text-[#10242b] transition hover:bg-[#7dc5ce]">
              View Rankings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {displaySquads.map((squad) => {
          const saved = squad.contributions
            ? squad.contributions.filter((c) => c.status === "success" || c.status === 1).reduce((total, c) => total + Number(c.amount || 0), 0)
            : Math.round((Number(squad.target_amount) * (squad.member_count || 1)) / 10);
          const progress = Math.min(100, Math.round((saved / Number(squad.target_amount || 1)) * 100));
          return (
            <div key={squad.id} className="rounded-[28px] border border-[#1d2e44] bg-[#09111c] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[#7c9fc2]">Total Saved</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(saved)}</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#18324a] bg-[#0c1b2f] text-sm font-semibold text-[#91d7ec]">
                  {progress}%
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div>
                  <p className="text-sm text-[#8ba3c8]">{squad.name}</p>
                  <div className="mt-3 h-2 rounded-full bg-[#10223b]">
                    <div className="h-full rounded-full bg-[#91d7ec]" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#7c9fc2]">Current Cycle</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/leaderboard/${squad.id}`} className="inline-flex items-center justify-center rounded-full border border-[#2a3c58] bg-[#91d7ec] px-5 py-3 text-sm font-semibold text-[#10242b] transition hover:bg-[#7dc5ce]">
                  Board
                </Link>
                <Link href="/payouts" className="inline-flex items-center justify-center rounded-full border border-[#2a3c58] bg-[#0e1c2f] px-5 py-3 text-sm font-semibold text-[#c6d7e9] transition hover:bg-[#13263b]">
                  Payouts
                </Link>
              </div>
            </div>
          );
        })}

        <Link href="/squads/new" className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-[#2a3c58] bg-[#08111c] p-6 text-center text-[#9bb4d6] transition hover:border-[#4a6b9d] hover:bg-[#0b1725]">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#0f1d31] text-2xl text-[#91d7ec]">+</div>
          <div>
            <p className="text-lg font-semibold text-white">Join New Squad</p>
            <p className="mt-2 text-sm text-[#8ba3c8]">Start a new saving cycle with friends or community.</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
