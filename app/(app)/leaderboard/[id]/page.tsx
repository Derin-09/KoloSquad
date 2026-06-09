"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { ArrowRight, Medal, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type SquadDetail = {
  id: string;
  name: string;
  target_amount: number;
  member_count: number;
  contributions?: { amount: number; status: string | number }[];
};

type LeaderEntry = {
  rank: number;
  name: string;
  xp: number;
  savings: number;
  badge: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SquadBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [squad, setSquad] = useState<SquadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSquad() {
      try {
        const { data, error } = await supabase
          .from("squads")
          .select("id, name, target_amount, member_count, contributions:contributions(amount,status)")
          .eq("id", id)
          .single();

        if (error || !data) {
          throw new Error("Could not load squad details.");
        }

        setSquad({
          id: data.id,
          name: data.name,
          target_amount: Number(data.target_amount || 0),
          member_count: Number(data.member_count || 0) || 12,
          contributions: data.contributions,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load squad");
      } finally {
        setLoading(false);
      }
    }

    void loadSquad();
  }, [id]);

  const saved = useMemo(() => {
    if (!squad) return 0;
    return (squad.contributions || []).filter((c) => c.status === "success" || c.status === 1).reduce((total, c) => total + Number(c.amount || 0), 0);
  }, [squad]);

  const xp = useMemo(() => Math.max(12450, Math.round(saved / 30) + 2500), [saved]);
  const rank = 42;
  const progress = useMemo(() => (squad?.target_amount ? Math.min(100, Math.round((saved / squad.target_amount) * 100)) : 0), [saved, squad?.target_amount]);

  const topSavers: LeaderEntry[] = useMemo(() => {
    const base: LeaderEntry[] = [
      { rank: 1, name: "James Sterling", xp: 28940, savings: 14200, badge: "Legendary" },
      { rank: 2, name: "Maya Wong", xp: 24100, savings: 12800, badge: "Diamond League" },
      { rank: 42, name: squad?.name || "You (Alex)", xp, savings: saved || 4500, badge: "Master Saver" },
      { rank: 43, name: "Leo Dupont", xp: 12200, savings: 4200, badge: "Diamond League" },
    ];
    return base;
  }, [rank, saved, squad?.name, xp]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05090f] px-4 py-10 text-white">
        <div className="inline-flex items-center gap-3 rounded-3xl border border-[#1f2b3c] bg-[#09111a] px-6 py-5 shadow-[0_20px_80px_rgba(0,0,0,0.3)]">
          <Sparkles className="h-5 w-5 animate-spin text-[#9ed7ec]" />
          <span className="text-sm text-[#c5d2e4]">Loading squad board…</span>
        </div>
      </main>
    );
  }

  if (error || !squad) {
    return (
      <main className="min-h-screen bg-[#05090f] px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/20 bg-[#120b10] p-8 text-center">
          <p className="text-lg font-semibold text-red-200">Unable to load squad board</p>
          <p className="mt-3 text-sm text-[#b7c3d4]">{error || "Please try again later."}</p>
          <Link href="/leaderboard" className="mt-6 inline-flex rounded-full bg-[#91d7ec] px-6 py-3 text-sm font-semibold text-[#10242b]">
            Back to Leaderboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05090f] px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-4xl border border-[#1f2a3d] bg-[#08111d]/90 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#112439] px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#8ac9ee]">
                <Medal className="h-4 w-4" />
                Diamond League
              </div>
              <h1 className="mt-5 text-4xl font-semibold">The Elite Tier</h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#96a9c6]">
                You&apos;re currently ranked #{rank} globally. Save {formatCurrency(120)} more this week to enter the Top 20.
              </p>
            </div>
            <div className="rounded-4xl border border-[#1a2a3e] bg-[#0c1a2f] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="mx-auto mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#112a49] text-4xl font-semibold text-[#91d7ec]">{String(squad.name?.[0] || "S")}</div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#82c9f0]">{formatCurrency(xp)} XP</p>
              <p className="mt-2 text-xl font-semibold">Master Saver</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-4xl border border-[#1f2a3d] bg-[#08101b]/90 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Global Savers</h2>
              <span className="rounded-full bg-[#112b48] px-3 py-2 text-sm text-[#8fc8f7]">{formatCurrency(saved)} Saved</span>
            </div>
            <div className="mt-6 space-y-4">
              {topSavers.map((entry) => (
                <div key={entry.rank} className={`rounded-3xl border p-4 ${entry.rank === rank ? "border-[#91d7ec] bg-[#0f1e31]" : "border-[#17263b] bg-[#09111c]"}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0f1e31] text-sm font-semibold text-[#91d7ec]">{entry.rank}</div>
                      <div>
                        <p className="font-semibold text-white">{entry.name}</p>
                        <p className="text-xs text-[#7f9fc2]">{entry.badge}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">{formatCurrency(entry.savings)}</p>
                      <p className="text-xs text-[#7f9fc2]">{entry.xp.toLocaleString()} XP</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-4 rounded-4xl border border-[#1f2a3d] bg-[#08101b]/90 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)]">
            <div className="rounded-3xl bg-[#0b1722] p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-[#7c9fc2]">League Rewards</p>
              <ul className="mt-4 space-y-3 text-sm text-[#c9d9ef]">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#112c46] text-[#92c9ee]">🏅</span>
                  <span>Top 10 Finish: Unique Badge & 0.5% Bonus</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#112c46] text-[#92c9ee]">🎟️</span>
                  <span>RoyalKolo NFT: Stay in Diamond for 3 seasons</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-[#172338] bg-[#09111c] p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-[#7c9fc2]">League News</p>
              <div className="mt-4 space-y-3 text-sm text-[#c9d9ef]">
                <p>James Sterling reached Emerald Rank, 2 hours ago.</p>
                <p>The Wealth Wizards squad jumped 4 spots, 5 hours ago.</p>
              </div>
            </div>

            <div className="rounded-[28px] bg-[#91d7ec]/10 p-5 text-sm text-[#d7f0fb]">
              <p className="font-semibold text-white">Join a Squad</p>
              <p className="mt-3">Squads earn 2x more XP through collaborative goals.</p>
              <Link href="/leaderboard" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0e1b2f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#13263c]">
                Find Squads
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
