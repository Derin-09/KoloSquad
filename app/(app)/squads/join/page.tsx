"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle2, Loader2, ShieldCheck, Sparkles, Users, Wallet } from "lucide-react";
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

  const platformFee = useMemo(() => weeklyContribution * 0.01, [weeklyContribution]);
  const totalDue = useMemo(() => weeklyContribution + platformFee, [platformFee, weeklyContribution]);

  const payoutDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  async function handleConfirmJoin() {
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

      router.replace(squad?.id ? `/squads/${squad.id}` : "/dashboard");
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
    <main className="mx-auto max-w-6xl rounded-[28px] border border-[#242424] bg-[#090b10] p-5 text-white shadow-[0_0_120px_rgba(30,45,84,0.2)] md:p-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Join the Squad</h1>
        <p className="text-sm text-[#9ea4b2]">
          Review your commitment and confirm your entry into the financial circle.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
        <section className="space-y-4">
          <div className="rounded-3xl border border-[#242932] bg-linear-to-br from-[#131926] via-[#10141d] to-[#0b1018] p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="inline-flex size-11 items-center justify-center rounded-full bg-[#3f351f] text-[#f6d384]">
                <Users className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{squad?.name || "Verified Squad"}</h2>
                <p className="text-xs uppercase tracking-[0.08em] text-[#9ca5b6]">
                  Active squad • {Math.max(1, Number(squad?.member_count || 0))} members
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="text-xs text-[#9ca5b6]">Weekly Contribution</p>
                <p className="mt-1 text-3xl font-semibold text-[#8bd3ff]">{formatCurrency(weeklyContribution)}</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="text-xs text-[#9ca5b6]">Next Payout Date</p>
                <p className="mt-1 inline-flex items-center gap-2 text-2xl font-semibold text-[#f4cf88]">
                  <CalendarDays className="size-5" />
                  {payoutDate}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#242932] bg-[#11141b] p-5">
            <h3 className="mb-4 text-xl font-semibold">Squad Benefits</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Sparkles className="mt-0.5 size-4 text-[#89d0ff]" />
                <p className="text-sm text-[#cad0dc]">
                  <span className="font-semibold text-white">Guaranteed Rotational Payout</span>
                  Receive your turn-based payout as scheduled within the circle.
                </p>
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 text-[#89d0ff]" />
                <p className="text-sm text-[#cad0dc]">
                  <span className="font-semibold text-white">Default Protection</span>
                  Members are vetted and contribution records are tracked for consistency.
                </p>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-4 text-[#89d0ff]" />
                <p className="text-sm text-[#cad0dc]">
                  <span className="font-semibold text-white">Credit Score Impact</span>
                  Strong participation history helps you build financial credibility.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-3xl border border-[#242932] bg-[#11141b] p-5">
            <h3 className="mb-4 text-2xl font-semibold">Payment Summary</h3>

            <div className="space-y-2 text-sm text-[#c2c9d8]">
              <div className="flex items-center justify-between">
                <span>First Deposit</span>
                <span className="font-semibold text-white">{formatCurrency(weeklyContribution)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#273043] pb-3">
                <span>Platform Fee (1%)</span>
                <span className="font-semibold text-white">{formatCurrency(platformFee)}</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-base">
                <span className="font-semibold text-white">Total Due</span>
                <span className="font-semibold text-[#8fe0f7]">{formatCurrency(totalDue)}</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#2a3345] bg-[#171f2e] p-4">
              <p className="inline-flex items-center gap-2 text-xs text-[#9fb8da]">
                <Wallet className="size-4" />
                Wallet Balance
              </p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(1420000)}</p>
            </div>

            <Button
              onClick={handleConfirmJoin}
              disabled={joining || !normalizedCode}
              className="mt-6 h-12 w-full rounded-full bg-[#a9d7df] text-[#072027] hover:bg-[#96c6cf]"
            >
              {joining ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Joining Squad...
                </span>
              ) : (
                "Confirm & Pay First Deposit"
              )}
            </Button>

            <p className="mt-3 text-center text-xs text-[#8992a2]">
              By confirming, you agree to the Squad Membership Terms and recurring weekly deductions.
            </p>

            {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#242932]">
            <Image
              src="/image/side-view-friends-with-smartphone.jpg"
              alt="Squad members planning together"
              width={680}
              height={340}
              className="h-44 w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#0d1118] via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 rounded-full bg-[#4d3d1f]/90 px-3 py-1 text-[11px] font-semibold text-[#f2cc82]">
              ESTABLISHED 2022
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
