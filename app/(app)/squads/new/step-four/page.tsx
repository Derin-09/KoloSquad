"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import {
  ArrowRight,
  Award,
  BellRing,
  ChevronLeft,
  Flame,
  TrendingDown,
  ShieldAlert,
  Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import {
  getSquadDraft,
  patchSquadDraft,
  type StepFourDraftValues,
} from "@/app/(app)/squads/new/draft-storage";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useAuthStore } from "@/stores/auth-store";

const initialStepFourValues: StepFourDraftValues = {
  penalties: {
    loseStreakIfMissed: false,
    funnyReminderMessage: true,
    dropOnLeaderboard: true,
  },
};

export default function StepFour() {
  const router = useRouter();
  const saved = getSquadDraft();
  const badgesData = useDashboardStore((state) => state.badgesData);
  const fetchBadges = useDashboardStore((state) => state.fetchBadges);
  const user = useAuthStore((state) => state.user);

  const { values, setFieldValue, setValues, handleSubmit } = useFormik<StepFourDraftValues>({
    initialValues: initialStepFourValues,
    onSubmit: () => {
      patchSquadDraft({ currentStep: 5, stepFour: values });
      router.push("/squads/new/step-five");
    },
  });

  useEffect(() => {
    patchSquadDraft({ currentStep: 4, stepFour: values });
  }, [values]);

  useEffect(() => {
    if (saved?.stepFour) {
      setValues({ ...initialStepFourValues, ...saved.stepFour });
    }
  }, [setValues]);

  useEffect(() => {
    if (!user?.id) return;
    fetchBadges(user.id);
  }, [user?.id, fetchBadges]);

  console.log(badgesData, 'badges')

  return (
    <main className="w-full px-8 py-2 sm:px-6 sm:py-3 lg:px-8">
      <button
        type="button"
        aria-label="Go back"
        onClick={router.back}
        className="mb-2 rounded-full p-1 text-foreground transition hover:bg-muted"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
          <p className="uppercase tracking-[0.12em] text-muted-foreground">Step 4 of 5</p>
          <p>Rules &amp; Rewards</p>
        </div>

        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full border border-border bg-muted">
          <div className="h-full w-[80%] rounded-full bg-accent" />
        </div>

        <div className="mt-6 space-y-2">
          <h1 className="text-4xl font-black leading-none text-foreground">Squad Rules</h1>
          <p className="text-sm text-muted-foreground">
            Define how your squad stays motivated and what they earn.
          </p>
        </div>

        <form className="mt-6 space-y-7" onSubmit={handleSubmit}>
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Squad Rewards</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <Card
                animated={false}
                hoverable={false}
                className="rounded-3xl border-2 border-foreground/90 bg-surface px-4 py-4"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-accent-foreground text-surface">
                  <Flame size={16} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-foreground">Streak Badge</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Earned after 7 days of consistent saving.
                </p>
              </Card>

              <Card
                animated={false}
                hoverable={false}
                className="rounded-3xl border-2 border-border bg-muted/40 px-4 py-4"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-surface text-foreground">
                  <Award size={16} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-foreground">Top Saver Badge</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Weekly honor for the highest contributor.
                </p>
              </Card>

              <Card
                animated={false}
                hoverable={false}
                className="rounded-3xl border-2 border-foreground/90 bg-surface px-4 py-4"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-accent-foreground text-surface">
                  <Trophy size={16} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-foreground">Goal Crusher Badge</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Unlocked when the total squad goal is met.
                </p>
              </Card>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Optional Penalties</h2>

            <button
              type="button"
              onClick={() =>
                setFieldValue(
                  "penalties.loseStreakIfMissed",
                  !values.penalties.loseStreakIfMissed
                )
              }
              className="flex w-full items-center justify-between rounded-3xl border-2 border-border bg-surface px-4 py-4 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-muted text-foreground">
                  <ShieldAlert size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Lose streak if missed</p>
                  <p className="text-xs text-muted-foreground">
                    Reset streak to zero after missing 24h.
                  </p>
                </div>
              </div>
              <span
                className={`mt-0.5 inline-flex size-5 items-center justify-center rounded-full border-2 ${
                  values.penalties.loseStreakIfMissed
                    ? "border-accent-foreground bg-accent-foreground"
                    : "border-foreground/80 bg-surface"
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setFieldValue(
                  "penalties.funnyReminderMessage",
                  !values.penalties.funnyReminderMessage
                )
              }
              className="flex w-full items-center justify-between rounded-3xl border-2 border-border bg-surface px-4 py-4 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-muted text-foreground">
                  <BellRing size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Funny reminder message</p>
                  <p className="text-xs text-muted-foreground">
                    Send a cheeky notification to late savers.
                  </p>
                </div>
              </div>
              <span
                className={`mt-0.5 inline-flex size-5 items-center justify-center rounded-full border-2 ${
                  values.penalties.funnyReminderMessage
                    ? "border-accent-foreground bg-accent-foreground"
                    : "border-foreground/80 bg-surface"
                }`}
              >
                {values.penalties.funnyReminderMessage ? (
                  <span className="inline-block size-2 rounded-full bg-surface" />
                ) : null}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setFieldValue(
                  "penalties.dropOnLeaderboard",
                  !values.penalties.dropOnLeaderboard
                )
              }
              className="flex w-full items-center justify-between rounded-3xl border-2 border-border bg-surface px-4 py-4 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-muted text-foreground">
                  <TrendingDown size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Drop on leaderboard</p>
                  <p className="text-xs text-muted-foreground">
                    Move down the leaderboard rank after missed contributions.
                  </p>
                </div>
              </div>
              <span
                className={`mt-0.5 inline-flex size-5 items-center justify-center rounded-full border-2 ${
                  values.penalties.dropOnLeaderboard
                    ? "border-accent-foreground bg-accent-foreground"
                    : "border-foreground/80 bg-surface"
                }`}
              >
                {values.penalties.dropOnLeaderboard ? (
                  <span className="inline-block size-2 rounded-full bg-surface" />
                ) : null}
              </span>
            </button>
          </section>

          <Card
            animated={false}
            hoverable={false}
            className="rounded-3xl border border-border bg-muted/50 px-5 py-5"
          >
            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
              <div>
                <p className="text-2xl font-black leading-none text-foreground">Why use rules?</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Squads with rewards and reminders are 4x more likely to reach
                  their financial goals within the first month.
                </p>
              </div>
              <div className="flex size-20 items-center justify-center rounded-3xl border border-border bg-accent-foreground text-surface">
                <Trophy size={28} />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-3xl"
              onClick={() => router.push("/squads/new/step-three")}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="h-12 rounded-3xl bg-accent-foreground text-surface hover:bg-accent-foreground/90"
            >
              <span className="font-semibold">Next Step</span>
              <ArrowRight size={18} />
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
