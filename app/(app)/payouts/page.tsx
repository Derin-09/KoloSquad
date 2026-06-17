"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Spinner from "@/app/loading";

interface Squad {
  id: string;
  name: string;
  target_amount: number;
  balance: number;
  contributions: { amount: number; status: string | number }[];
  member_count?: number;
}

type HistoryItem = {
  label: string;
  date: string;
  amount: number;
  status: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PayoutsPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("squads")
          .select("id, name, target_amount, member_count, contributions:contributions(amount,status)");
        if (error) throw error;

        const mapped = (data || []).map((s) => ({
          ...s,
          balance: (s.contributions || [])
            .filter((c) => c.status === "success" || c.status === 1)
            .reduce((total: number, c) => total + Number(c.amount || 0), 0),
        }));

        setSquads(mapped);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load payouts";
        setErr(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const primarySquad = useMemo(() => squads[0] || null, [squads]);

  const payoutProgress = useMemo(() => {
    if (!primarySquad || !primarySquad.target_amount) return 0;
    return Math.min(100, Math.round((primarySquad.balance / primarySquad.target_amount) * 100));
  }, [primarySquad]);

  const history: HistoryItem[] = useMemo(() => {
    if (!primarySquad) {
      return [
        { label: "Sep Payout", date: "Sep 28, 2024", amount: 14400, status: "Paid" },
        { label: "Aug Payout", date: "Aug 28, 2024", amount: 14400, status: "Paid" },
        { label: "Jul Payout", date: "Jul 28, 2024", amount: 14400, status: "Paid" },
      ];
    }

    return [
      { label: "Sep Payout", date: "Sep 28, 2024", amount: primarySquad.target_amount, status: "Paid" },
      { label: "Aug Payout", date: "Aug 28, 2024", amount: primarySquad.target_amount, status: "Paid" },
      { label: "Jul Payout", date: "Jul 28, 2024", amount: primarySquad.target_amount, status: "Paid" },
    ];
  }, [primarySquad]);

  const nextPayoutDate = useMemo(() => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 14);
    return nextDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }, []);

  const upcomingPayoutAmount = useMemo(() => {
    if (!primarySquad) return 2400;
    return Math.round(primarySquad.target_amount / Math.max(primarySquad.member_count || 1, 1));
  }, [primarySquad]);

  const totalReceived = useMemo(() => {
    return history.reduce((sum, item) => sum + item.amount, 0);
  }, [history]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Spinner />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 text-white">
      <section className="rounded-4xl border border-[#1f2a3d] bg-[#08111b]/90 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl font-semibold">Payout Schedule</h1>
            <p className="max-w-xl text-sm leading-6 text-[#94a4c0]">
              Your rotational cycle is currently in its {payoutProgress >= 75 ? "4th" : "next"} month. Stay consistent to unlock the premium squad tier.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-3xl bg-[#0f1b2d] px-4 py-3 text-sm text-[#d7e4ff] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#192a3d]/80 text-[#93cfe6]">📅</span>
                <span>Next Payout: {nextPayoutDate}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-3xl bg-[#0f1b2d] px-4 py-3 text-sm text-[#d7e4ff] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#192a3d]/80 text-[#93cfe6]">💰</span>
                <span>{formatCurrency(upcomingPayoutAmount)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative inline-flex h-48 w-48 items-center justify-center rounded-full bg-[#0b1724]">
              <div
                className="absolute inset-0 rounded-full border border-[#1f2d44]"
                style={{ background: `conic-gradient(#8adce7 ${payoutProgress * 3.6}deg, rgba(33, 46, 69, 0.3) 0deg)` }}
              />
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-[#08101a]">
                <div className="text-center">
                  <p className="text-3xl font-semibold text-white">{payoutProgress}%</p>
                  <p className="text-sm text-[#8aa5c2]">Cycle Progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <section className="space-y-4 rounded-4xl border border-[#1f2a3d] bg-[#08101b]/90 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Squad Payouts</h2>
            <button className="text-sm font-semibold text-[#82c9f0] hover:text-[#b2e2ff]">View All</button>
          </div>

          <div className="space-y-4">
            {(squads.length ? squads : [{ id: "empty", name: "Alpha Squad", balance: 2400, target_amount: 6000, member_count: 12 }]).map((squad) => {
              const isPrimary = squad.id === primarySquad?.id;
              const payoutAmount = Math.round((squad.target_amount || 2400) / Math.max(squad.member_count || 6, 1));
              const scheduleDate = nextPayoutDate;
              const status = isPrimary ? "Pending Release" : "Scheduled";

              return (
                <div key={squad.id} className="rounded-3xl border border-[#172338] bg-[#0b1722] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-[#8aa5c2]">{squad.name}</p>
                      <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(payoutAmount)}</p>
                      <p className="text-xs text-[#7f9fc1]">{squad.member_count || 8} members • Turn {isPrimary ? 4 : 5}</p>
                    </div>
                    <div className="rounded-full bg-[#10263b] px-3 py-2 text-xs font-semibold text-[#a5d4f2]">
                      {status}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#8aa5c2]">
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-[#09111a] px-3 py-2">Scheduled: {scheduleDate}</span>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-[#09111a] px-3 py-2">{squad.name} • Turn {isPrimary ? 4 : 5}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4 rounded-4xl border border-[#1f2a3d] bg-[#08101b]/90 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)]">
          <div className="rounded-3xl bg-[#0b1722] p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-[#7c98be]">History</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(totalReceived)}</p>
            <p className="mt-2 text-sm text-[#8aa5c2]">Total received</p>
          </div>

          <div className="space-y-3 rounded-3xl border border-[#172338] bg-[#0d1723] p-5">
            {history.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-3xl border border-[#19263a] bg-[#08111c] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-[#7f9fc1]">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatCurrency(item.amount)}</p>
                  <p className="text-xs text-[#7ac9ff]">{item.status}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full rounded-full bg-[#162a4d] px-4 py-3 text-sm font-semibold text-[#b9d6f2] transition hover:bg-[#1e3b60]">
            Download Report
          </button>

          <div className="rounded-3xl border border-[#172338] bg-[#08111c] p-4 text-sm text-[#8aa5c2]">
            <p className="font-semibold text-white">Pro Tip</p>
            <p className="mt-2">Consistent on-time payments for 6 months unlock a 0.5% bonus on your next payout.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
