"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ChartNoAxesColumnIncreasing,
  Loader2,
  Shield,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type SquadLookupResult = {
  id: string;
  name?: string;
  invite_code?: string;
  target_amount?: number;
  amount_per_member?: number;
  member_count?: number;
  duration?: string;
  duration_number?: number;
  frequency?: string;
};

type LeaderboardEntry = {
  name: string;
  consistency: string;
  amount: string;
};

const leaderboard: LeaderboardEntry[] = [
  { name: "Alex Rivero", consistency: "Consistency: 100%", amount: "$42k" },
  { name: "Jordan Wei", consistency: "Consistency: 98%", amount: "$38k" },
  { name: "Sarah Connor", consistency: "Consistency: 95%", amount: "$31k" },
];

function normalizeCode(input: string) {
  return input.trim().toUpperCase();
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export default function JoinSquadPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [code, setCode] = useState("");
  const [squad, setSquad] = useState<SquadLookupResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedCode = useMemo(() => normalizeCode(code), [code]);

  useEffect(() => {
    const codeFromQuery = normalizeCode(params.get("code") || "");
    const squadIdFromQuery = params.get("squadId") || "";

    setCode(codeFromQuery);

    async function fetchSquadByCode() {
      const rpcResponse = await supabase
        .rpc("get_squad_by_code", { code: codeFromQuery })
        .single<SquadLookupResult>();

      if (!rpcResponse.error && rpcResponse.data) {
        return rpcResponse.data;
      }

      const query = supabase
        .from("squads")
        .select("id, name, invite_code, target_amount, amount_per_member, member_count, duration, duration_number, frequency");

      const fallbackResponse = squadIdFromQuery
        ? await query.eq("id", squadIdFromQuery).single<SquadLookupResult>()
        : await query.eq("invite_code", codeFromQuery).single<SquadLookupResult>();

      if (fallbackResponse.error || !fallbackResponse.data) {
        throw new Error("We could not find this squad. Please verify the join code.");
      }

      return fallbackResponse.data;
    }

    async function loadPreview() {
      if (!codeFromQuery) {
        setError("Missing squad code. Enter your code from Join Squad to continue.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const cacheKey = `join-squad-preview:${codeFromQuery}`;
        const cached = typeof window !== "undefined" ? sessionStorage.getItem(cacheKey) : null;

        if (cached) {
          const parsed = JSON.parse(cached) as SquadLookupResult;
          setSquad(parsed);
          setLoading(false);
          return;
        }

        const fetchedSquad = await fetchSquadByCode();
        setSquad(fetchedSquad);

        if (typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify(fetchedSquad));
        }
      } catch (previewError) {
        const message =
          previewError instanceof Error
            ? previewError.message
            : "Unable to fetch squad preview right now.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadPreview();
  }, [params]);

  const weeklyContribution = useMemo(() => {
    if (squad?.amount_per_member && Number(squad.amount_per_member) > 0) {
      return Number(squad.amount_per_member);
    }

    const target = Number(squad?.target_amount || 0);
    const members = Number(squad?.member_count || 0);

    if (target > 0 && members > 0) {
      return target / members;
    }

    return 0;
  }, [squad?.amount_per_member, squad?.member_count, squad?.target_amount]);

  const annualGoal = useMemo(() => Number(squad?.target_amount || 320000), [squad?.target_amount]);
  const progressPercent = 75;
  const assetsValue = useMemo(() => Math.round((annualGoal * progressPercent) / 100), [annualGoal]);

  async function handleJoinSquad() {
    if (!normalizedCode) {
      setError("Missing join code.");
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const { error: joinError } = await supabase.rpc("join_squad_by_code", {
        code: normalizedCode,
      });

      if (joinError) {
        throw new Error(joinError.message || "Failed to join squad.");
      }

      const successUrl = squad?.id
        ? `/squads/join/success?squadId=${encodeURIComponent(squad.id)}`
        : `/squads/join/success?code=${encodeURIComponent(normalizedCode)}`;

      router.replace(successUrl);
    } catch (joinError) {
      const message =
        joinError instanceof Error
          ? joinError.message
          : "Failed to complete squad join.";
      setError(message);
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading squad details...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl rounded-[28px] border border-[#20242d] bg-[#090c13] p-5 text-white shadow-[0_0_90px_rgba(21,33,61,0.28)] md:p-8">
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <section className="rounded-3xl border border-[#2a303d] bg-linear-to-br from-[#1a1d24] via-[#151922] to-[#12161d] p-5">
          <div className="mb-4 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-[#3a311f] px-3 py-1 text-[#f1c66d]">High Performance</span>
            <span className="rounded-full border border-[#3a4050] px-3 py-1 text-[#d6dbe7]">Public Squad</span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight">{squad?.name || "Tech Titans"}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#c6ccda]">
            The elite circle for engineering leads and tech enthusiasts building long-term wealth through disciplined weekly savings.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#8e97ac]">Total Assets</p>
              <p className="mt-1 text-4xl font-semibold text-[#9fe3ff]">{formatCurrency(assetsValue)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#8e97ac]">Squad Rank</p>
              <p className="mt-1 text-4xl font-semibold text-[#edcb90]">#4 Globally</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#2a303d] bg-linear-to-br from-[#1a1d24] via-[#151922] to-[#12161d] p-5">
          <h2 className="text-center text-sm font-semibold text-[#cfd6e3]">Annual Goal Progress</h2>
          <div className="mt-4 flex justify-center">
            <div
              className="relative grid size-36 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#a6dfe9 ${progressPercent * 3.6}deg, #2f3747 0deg)`,
              }}
            >
              <div className="grid size-28 place-items-center rounded-full bg-[#131821]">
                <p className="text-4xl font-bold">{progressPercent}%</p>
                <p className="text-xs text-[#a6aec2]">Complete</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-lg font-semibold text-[#d3d8e4]">
            Goal: {formatCurrency(annualGoal)}
          </p>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <section className="rounded-3xl border border-[#2a303d] bg-linear-to-br from-[#1a1d24] via-[#151922] to-[#12161d] p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-3xl font-semibold">Leaderboard</h3>
            <ChartNoAxesColumnIncreasing className="size-5 text-[#8ec7ff]" />
          </div>

          <ul className="space-y-4">
            {leaderboard.map((entry, index) => (
              <li
                key={entry.name}
                className="flex items-center justify-between rounded-2xl border border-[#2d3443] bg-[#121821]/80 px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#3a311f] text-sm font-semibold text-[#f1c66d]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{entry.name}</p>
                    <p className="text-xs text-[#a6aec2]">{entry.consistency}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#a2daf8]">{entry.amount}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-[#2a303d] bg-linear-to-br from-[#1a1d24] via-[#151922] to-[#12161d] p-5">
          <h3 className="mb-4 text-3xl font-semibold">Squad Rules</h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#2d3443] bg-[#121821]/70 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#a8d8ff]">
                <Users className="size-4" />
                Weekly Contribution
              </p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(weeklyContribution)} minimum</p>
              <p className="mt-1 text-xs text-[#a6aec2]">Due every Sunday by 11:59 PM</p>
            </div>

            <div className="rounded-2xl border border-[#2d3443] bg-[#121821]/70 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#ffb2a8]">
                <AlertTriangle className="size-4" />
                Penalty Clause
              </p>
              <p className="mt-2 text-2xl font-semibold">5% Late Fee</p>
              <p className="mt-1 text-xs text-[#a6aec2]">Redistributed to active members</p>
            </div>

            <div className="rounded-2xl border border-[#2d3443] bg-[#121821]/70 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#f5c476]">
                <Shield className="size-4" />
                Grace Period
              </p>
              <p className="mt-2 text-2xl font-semibold">2 Passes per Year</p>
              <p className="mt-1 text-xs text-[#a6aec2]">Notification required 48hrs prior</p>
            </div>

            <div className="rounded-2xl border border-[#2d3443] bg-[#121821]/70 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#9fd5ff]">
                <Users className="size-4" />
                Membership
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {Math.max(1, Number(squad?.member_count || 0))}/15 Members
              </p>
              <p className="mt-1 text-xs text-[#a6aec2]">3 spots available currently</p>
            </div>
          </div>

          <div className="mt-5 border-t border-[#2d3443] pt-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[#9aa3b8]">Member Activity</p>
            <div className="mt-3 flex items-center">
              {Array.from({ length: 5 }).map((_, idx) => (
                <span
                  key={idx}
                  className="-mr-2 inline-flex size-9 items-center justify-center rounded-full border-2 border-[#0f141c] bg-linear-to-br from-[#2e3749] to-[#18222f] text-xs font-semibold text-[#e7ecf6]"
                >
                  {String.fromCharCode(65 + idx)}
                </span>
              ))}
              <span className="ml-2 inline-flex rounded-full bg-[#223244] px-2 py-1 text-xs text-[#9ed8ff]">+7</span>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          onClick={handleJoinSquad}
          disabled={joining || !normalizedCode}
          className="h-14 min-w-55 rounded-full bg-[#a9d7df] px-8 text-lg font-semibold text-[#10242b] hover:bg-[#96c6cf]"
        >
          {joining ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Joining Squad...
            </span>
          ) : (
            "Join This Squad"
          )}
        </Button>
      </div>

      {error ? <p className="mt-4 text-center text-sm text-red-400">{error}</p> : null}
    </main>
  );
}
