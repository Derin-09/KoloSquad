"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  ChevronLeft,
  Loader2,
  Rocket,
  ShieldAlert,
  Target,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { useSquadStore } from "@/stores/squad-store";
import { useAuthStore } from "@/stores/auth-store";
import { clearSquadDraft, getSquadDraft, patchSquadDraft } from "@/app/(app)/squads/new/draft-storage";

const rewards = ["Streak Badge", "Top Saver Badge", "Goal Crusher Badge"];

function toNumericAmount(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function durationToWeeks(unit: "week(s)" | "month(s)" | "year(s)", count: number) {
  if (unit === "week(s)") return Math.max(1, count);
  if (unit === "month(s)") return Math.max(1, count * 4);
  return Math.max(1, count * 52);
}

function weeksToContributionPeriods(
  totalWeeks: number,
  frequency: "weekly" | "monthly" | "yearly"
) {
  if (frequency === "weekly") return Math.max(1, totalWeeks);
  if (frequency === "monthly") return Math.max(1, Math.ceil(totalWeeks / 4));
  return Math.max(1, Math.ceil(totalWeeks / 52));
}

function formatNaira(amount: number) {
  return `N${Math.round(amount).toLocaleString()}`;
}

function modeLabel(mode: "relaxed" | "casual" | "hustle") {
  if (mode === "hustle") return "Competitive";
  if (mode === "casual") return "Balanced";
  return "Relaxed";
}

export default function StepFive() {
  const router = useRouter();
  const createSquadInStore = useSquadStore((state) => state.createSquad);
  const user = useAuthStore((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draft = getSquadDraft();

  useEffect(() => {
    patchSquadDraft({ currentStep: 5 });
  }, []);

  useEffect(() => {
    if (!draft?.stepOne || !draft?.stepTwo || !draft?.stepThree || !draft?.stepFour) {
      router.replace("/squads/new/step-one");
    }
  }, [draft?.stepFour, draft?.stepOne, draft?.stepThree, draft?.stepTwo, router]);

  const summary = useMemo(() => {
    const stepOne = draft?.stepOne;
    const stepTwo = draft?.stepTwo;
    const stepThree = draft?.stepThree;
    const stepFour = draft?.stepFour;

    if (!stepOne || !stepTwo || !stepThree || !stepFour) return null;

    const targetAmount = toNumericAmount(stepOne.goalAmount);
    const totalWeeks = durationToWeeks(stepOne.duration, stepOne.durationNumber);
    const periods = weeksToContributionPeriods(totalWeeks, stepTwo.frequency);
    const amountPerMember = targetAmount > 0 ? targetAmount / Math.max(1, stepThree.memberCount) / periods : 0;

    const penalties: string[] = [];
    if (stepFour.penalties.loseStreakIfMissed) penalties.push("Lose streak if missed");
    if (stepFour.penalties.funnyReminderMessage) penalties.push("Funny reminder message");
    if (stepFour.penalties.dropOnLeaderboard) penalties.push("Drop on leaderboard");

    return {
      name: stepOne.squadName,
      targetAmount,
      duration: `${stepOne.durationNumber} ${stepOne.duration}`,
      memberCount: stepThree.memberCount,
      frequency: stepTwo.frequency,
      mode: stepTwo.mode,
      amountPerMember,
      penalties,
    };
  }, [draft?.stepFour, draft?.stepOne, draft?.stepThree, draft?.stepTwo]);

  console.log(summary, 'summary')
  console.log(user, 'user')


  const handleCreateSquad = async () => {
    // Ensure both summary and user are loaded before submission
    if (!summary) {
      setError("Squad details not loaded. Please refresh.");
      return;
    }
    
    if (!user?.id) {
      setError("User session not ready. Please wait a moment and try again.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const squad = await createSquadInStore({
        userId: user.id,
        name: summary.name,
        targetAmount: summary.targetAmount,
        duration: draft!.stepOne!.duration,
        durationNumber: draft!.stepOne!.durationNumber,
        memberCount: summary.memberCount,
        amountPerMember: summary.amountPerMember,
        frequency: summary.frequency,
        rewards,
        penalties: summary.penalties,
      });

      clearSquadDraft();
      router.replace(`/squads/${squad.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create squad");
      setIsSubmitting(false);
    }
  };

  if (!summary) return null;

  return (
    <main className="w-full px-8 py-2 sm:px-6 sm:py-3 lg:px-8">
      <button
        type="button"
        aria-label="Go back"
        onClick={() => router.push("/squads/new/step-four")}
        className="mb-2 rounded-full p-1 text-foreground transition hover:bg-muted"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
          <p className="uppercase tracking-[0.12em] text-muted-foreground">Step 5 of 5</p>
          <p>Confirm Squad</p>
        </div>

        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full border border-border bg-muted">
          <div className="h-full w-full rounded-full bg-accent" />
        </div>

        <div className="mt-6 space-y-2">
          <h1 className="text-4xl font-black leading-none text-foreground">Confirm Squad</h1>
          <p className="text-sm text-muted-foreground">
            Review all squad details before creating it. You can still go back and edit.
          </p>
        </div>

        <Card
          animated={false}
          hoverable={false}
          className="mt-6 rounded-4xl border-2 border-border bg-surface px-5 py-5"
        >
          <div className="rounded-xl border border-border bg-muted/50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Squad Name
            </p>
            <p className="text-2xl font-black text-foreground">{summary.name}</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Goal</p>
              <p className="text-lg font-black text-foreground">{formatNaira(summary.targetAmount)}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Duration
              </p>
              <p className="text-lg font-black text-foreground">{summary.duration}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-foreground">
                <Users size={15} className="text-muted-foreground" /> Members
              </p>
              <p className="font-semibold text-foreground">{summary.memberCount} Total</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-foreground">
                <Target size={15} className="text-muted-foreground" /> Frequency
              </p>
              <p className="font-semibold capitalize text-foreground">{summary.frequency}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-foreground">
                <ShieldAlert size={15} className="text-muted-foreground" /> Mode
              </p>
              <p className="font-semibold text-foreground">{modeLabel(summary.mode)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-foreground">
                <Award size={15} className="text-muted-foreground" /> Rewards
              </p>
              <p className="font-semibold text-foreground">{rewards.length} Enabled</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-muted/30 p-3 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Contribution / member
              </p>
              <p className="text-xl font-black text-foreground">{formatNaira(summary.amountPerMember)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Penalties
              </p>
              <p className="text-sm font-semibold text-foreground">
                {summary.penalties.length > 0 ? summary.penalties.join(", ") : "No penalties selected"}
              </p>
            </div>
          </div>
        </Card>

        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

        <Button
          type="button"
          onClick={handleCreateSquad}
          disabled={isSubmitting || !user?.id}
          className="mt-4 h-12 w-full rounded-2xl bg-accent-foreground text-surface hover:bg-accent-foreground/90"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
          <span className="font-semibold">
            {isSubmitting ? "Creating Squad..." : !user?.id ? "Waiting for user..." : "Create Squad"}
          </span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="mt-2 h-11 w-full rounded-2xl"
          onClick={() => router.push("/squads/new/step-four")}
          disabled={isSubmitting}
        >
          Go Back & Edit
        </Button>
      </div>
    </main>
  );
}
