"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Share2, Sparkles, Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type SquadSuccessData = {
  id: string;
  name: string;
  invite_code: string;
  member_count: number;
  target_amount: number;
  amount_per_member: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function JoinSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const squadId = params.get("squadId");
  const inviteCode = params.get("code");

  const [squad, setSquad] = useState<SquadSuccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadSquad() {
      if (!squadId && !inviteCode) {
        setError("Missing squad reference. Please return to the join flow.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const query = supabase
        .from("squads")
        .select("id, name, invite_code, member_count, target_amount, amount_per_member");

      const response = squadId
        ? await query.eq("id", squadId).single<SquadSuccessData>()
        : await query.eq("invite_code", inviteCode).single<SquadSuccessData>();

      if (response.error || !response.data) {
        setError("Unable to load squad details. Please try again.");
        setLoading(false);
        return;
      }

      setSquad(response.data);
      setLoading(false);
    }

    void loadSquad();
  }, [inviteCode, squadId]);

  const milestoneTarget = useMemo(() => 500, []);
  const currentSaved = useMemo(() => {
    if (!squad) return 0;
    return Math.min(squad.member_count * (squad.amount_per_member || 0), milestoneTarget);
  }, [milestoneTarget, squad]);
  const milestoneProgress = useMemo(
    () => (milestoneTarget > 0 ? Math.min(100, Math.round((currentSaved / milestoneTarget) * 100)) : 0),
    [currentSaved, milestoneTarget]
  );

  async function handleInvite() {
    if (!squad?.invite_code) return;

    const message = `Join ${squad.name} with code ${squad.invite_code}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Join ${squad.name}`,
          text: message,
        });
      } else {
        await navigator.clipboard.writeText(squad.invite_code);
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (copyError) {
      try {
        await navigator.clipboard.writeText(squad.invite_code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        setError("Unable to share the invite code. Please copy it manually.");
      }
    }
  }

  function handleDashboard() {
    if (!squad?.id) {
      router.push("/squads");
      return;
    }

    router.push(`/squads/${squad.id}`);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06090f] px-4 py-10 text-white">
        <div className="inline-flex items-center gap-3 rounded-3xl border border-[#1f2b3c] bg-[#09111a] px-6 py-5 shadow-[0_20px_80px_rgba(0,0,0,0.3)]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#13203b]/70 text-[#a9e1f0]">
            <Sparkles className="h-5 w-5 animate-spin" />
          </span>
          <span className="text-sm text-[#c5d2e4]">Loading your squad welcome screen…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05090f] px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl rounded-[40px] border border-[#263349] bg-[#071018]/90 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#1f2f45] text-[#f6e7c2] shadow-[0_20px_50px_rgba(51,77,104,0.35)]">
            <Sparkles className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-semibold">Welcome to the Squad!</h1>
          <p className="mt-4 text-sm leading-7 text-[#96a9c6]">
            You&apos;ve successfully joined the elite inner circle. Your journey towards financial mastery begins today alongside your new teammates.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-4xl border border-[#1d2b3e] bg-[#08111c] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7b9bc2]">Squad</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">{squad &&  squad.name}</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#0c1a2b] px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#a3c4eb]">
                <Users className="h-4 w-4" />
                Active Squad
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-3xl border border-[#18273a] bg-[#09141f] p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#7f9abb]">Active Members</p>
                <p className="mt-3 text-3xl font-semibold text-white">{squad && squad.member_count || 1}/15</p>
              </div>

              <div className="flex items-center gap-3">
                {Array.from({ length: Math.min(squad && squad.member_count || 1, 4) }).map((_, index) => (
                  <span
                    key={index}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1b2a40] text-sm font-semibold text-[#d4e7ff]"
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                ))}
                {squad && squad.member_count > 4 && (
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0f1d2e] text-sm font-semibold text-[#9bbad6]">
                    +{Math.max(squad.member_count - 4, 0)}
                  </span>
                )}
              </div>

              <div className="rounded-3xl border border-[#18273a] bg-[#07101a] p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#7f9abb]">Invite Code</p>
                <div className="mt-3 inline-flex items-center justify-between rounded-2xl bg-[#0f1b2d] px-4 py-3 text-sm font-semibold text-[#dbe8ff]">
                  <span>{squad && squad.invite_code}</span>
                  <span className="rounded-full bg-[#1f3b53] px-3 py-1 text-[0.70rem] uppercase tracking-[0.24em] text-[#8bbae8]">
                    Code
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-4xl border border-[#1d2b3e] bg-[#08111c] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7b9bc2]">First Milestone</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Save $500 as a team</h2>
              </div>
              <div className="inline-flex h-10 items-center rounded-full bg-[#102340] px-3 text-sm text-[#94c7ee]">
                {milestoneProgress}%
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-3xl bg-[#0c1b2f] p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-[#8fa7c8]">
                  <span>Progress</span>
                  <span>{formatCurrency(currentSaved)} / {formatCurrency(milestoneTarget)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#12243f]/80">
                  <div className="h-full rounded-full bg-linear-to-r from-[#77d7f8] to-[#4c99ff]" style={{ width: `${milestoneProgress}%` }} />
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#96a9c6]">
                You&apos;re already making progress toward the first target. Keep inviting friends and contributing weekly to stay on track.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={handleInvite}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9ed7ec] px-6 py-4 text-sm font-semibold text-[#08262c] transition hover:bg-[#7dc9d8]"
          >
            <Share2 className="h-4 w-4" />
            {copied ? "Invite Copied" : "Invite Friends"}
          </button>

          <button
            type="button"
            onClick={handleDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#3a4c67] bg-[#0e1b2f] px-6 py-4 text-sm font-semibold text-white transition hover:border-[#5d82ad] hover:bg-[#13263c]"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {error ? (
          <p className="mt-6 text-center text-sm text-red-300">{error}</p>
        ) : null}
      </div>
    </main>
  );
}
