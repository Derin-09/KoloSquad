"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type SquadPreview = {
  id: string;
  name?: string;
  target_amount?: number;
  amount_per_member?: number;
  member_count?: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export default function ContributionsPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [squad, setSquad] = useState<SquadPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const squadIdFromQuery = params.get("squadId") || "";

    async function loadContributionContext() {
      setLoading(true);
      setError(null);

      try {
        if (squadIdFromQuery) {
          const { data, error: squadError } = await supabase
            .from("squads")
            .select("id, name, target_amount, amount_per_member, member_count")
            .eq("id", squadIdFromQuery)
            .single<SquadPreview>();

          if (squadError || !data) {
            throw new Error("Unable to load the selected squad.");
          }

          setSquad(data);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Sign in required to view contribution details.");
        }

        const { data, error: rpcError } = await supabase.rpc("get_user_squads", {
          user_uuid: user.id,
        });

        if (rpcError || !data || data.length === 0) {
          throw new Error("No squad found yet. Join or create a squad first.");
        }

        const firstSquad = data[0] as SquadPreview;
        setSquad(firstSquad);
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load contributions right now.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadContributionContext();
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

  const nextDueDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  function handleContributionAction() {
    if (!squad?.id) return;

    setProcessing(true);
    router.push(`/squads/${squad.id}`);
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading contribution details...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl rounded-[28px] border border-[#242424] bg-[#090b10] p-5 text-white shadow-[0_0_120px_rgba(30,45,84,0.2)] md:p-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Make a Contribution</h1>
        <p className="text-sm text-[#9ea4b2]">
          Review your contribution summary and confirm this week&apos;s payment.
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
                <h2 className="text-xl font-semibold">{squad?.name || "Active Squad"}</h2>
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
                <p className="text-xs text-[#9ca5b6]">Next Due Date</p>
                <p className="mt-1 inline-flex items-center gap-2 text-2xl font-semibold text-[#f4cf88]">
                  <CalendarDays className="size-5" />
                  {nextDueDate}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#242932] bg-[#11141b] p-5">
            <h3 className="mb-4 text-xl font-semibold">Contribution Benefits</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Sparkles className="mt-0.5 size-4 text-[#89d0ff]" />
                <p className="text-sm text-[#cad0dc]">
                  <span className="font-semibold text-white">Guaranteed Rotational Payout</span>
                  Stay consistent and keep your position in the payout cycle.
                </p>
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 text-[#89d0ff]" />
                <p className="text-sm text-[#cad0dc]">
                  <span className="font-semibold text-white">Contribution Protection</span>
                  Your records are tracked and contribution status stays transparent.
                </p>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-4 text-[#89d0ff]" />
                <p className="text-sm text-[#cad0dc]">
                  <span className="font-semibold text-white">Consistency Rewards</span>
                  Timely payments improve your contribution streak and member score.
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
                <span>Weekly Deposit</span>
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
              onClick={handleContributionAction}
              disabled={processing || !squad?.id}
              className="mt-6 h-12 w-full rounded-full bg-[#a9d7df] text-[#072027] hover:bg-[#96c6cf]"
            >
              {processing ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Opening Squad...
                </span>
              ) : (
                "Confirm & Pay Contribution"
              )}
            </Button>

            <p className="mt-3 text-center text-xs text-[#8992a2]">
              By confirming, you agree to your squad&apos;s contribution terms and weekly deductions.
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
              CONSISTENCY BUILDS WEALTH
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
