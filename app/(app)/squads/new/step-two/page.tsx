"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { ArrowRight, BadgeCheck, Minus, Plus, UserPlus2, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import {
  getSquadDraft,
  patchSquadDraft,
  type StepTwoDraftValues,
} from "@/app/(app)/squads/new/draft-storage";

export const initialStepTwoValues: StepTwoDraftValues = {
  memberCount: 5,
};

function toNumericAmount(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function durationToWeeks(unit: "week(s)" | "month(s)" | "year(s)", count: number) {
  if (unit === "week(s)") return Math.max(1, count);
  if (unit === "month(s)") return Math.max(1, count * 4);
  return Math.max(1, count * 52);
}

function formatNaira(amount: number) {
  return `N${Math.round(amount).toLocaleString()}`;
}

export default function StepTwo() {
  const router = useRouter();
  const draft = getSquadDraft();

  const { values, setFieldValue, handleSubmit, setValues } = useFormik<StepTwoDraftValues>({
    initialValues: initialStepTwoValues,
    onSubmit: () => {
      patchSquadDraft({ currentStep: 3, stepTwo: values });
      router.push("/squads/new/step-three");
    },
  });

  useEffect(() => {
    patchSquadDraft({ currentStep: 2, stepTwo: values });
  }, [values]);

  useEffect(() => {
    const saved = getSquadDraft();
    if (saved?.stepTwo) {
      setValues({ ...initialStepTwoValues, ...saved.stepTwo });
    }
  }, [setValues]);

  const goalAmount = toNumericAmount(draft?.stepOne?.goalAmount ?? "0");
  const durationCount = draft?.stepOne?.durationNumber ?? 1;
  const durationUnit = draft?.stepOne?.duration ?? "month(s)";
  const totalWeeks = durationToWeeks(durationUnit, durationCount);

  const { individualWeeklyAmount, totalWeeklyGoal } = useMemo(() => {
    const weeklyGoal = goalAmount > 0 ? goalAmount / totalWeeks : 0;
    const perMember = values.memberCount > 0 ? weeklyGoal / values.memberCount : 0;
    return {
      individualWeeklyAmount: perMember,
      totalWeeklyGoal: weeklyGoal,
    };
  }, [goalAmount, totalWeeks, values.memberCount]);

  return (
    <main className="w-full px-8 py-2 sm:px-6 sm:py-3 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center">
        <Card
          animated={false}
          hoverable={false}
          className="w-full max-w-130 rounded-4xl border-2 border-border bg-surface px-8 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.12)] sm:px-10 sm:py-9"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
            <p className="uppercase tracking-[0.12em] text-muted-foreground">Step 2 of 5</p>
            <p>40% Complete</p>
          </div>

          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full border border-border bg-muted">
            <div className="h-full w-[40%] rounded-full bg-accent-foreground" />
          </div>

          <div className="mt-6 space-y-2">
            <h1 className="text-3xl font-black leading-none text-foreground">Building the squad</h1>
            <p className="text-sm text-muted-foreground">
              How many people are saving with you? More members mean lower individual contributions.
            </p>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-semibold text-foreground">Number of Members</label>
              <div className="flex items-center justify-between rounded-3xl border-2 border-border bg-surface px-4 py-2">
                <input
                  type="number"
                  min={1}
                  name="memberCount"
                  value={values.memberCount}
                  onChange={(e) => setFieldValue("memberCount", Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 border-none bg-transparent text-2xl font-semibold outline-none"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setFieldValue("memberCount", Math.max(1, values.memberCount - 1))}
                    className="size-9 rounded-xl border-border"
                  >
                    <Minus size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setFieldValue("memberCount", values.memberCount + 1)}
                    className="size-9 rounded-xl border-border"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-3xl border-border bg-surface"
            >
              <UserPlus2 size={16} />
              Invite First
            </Button>

            <div className="rounded-4xl border-2 border-border bg-surface px-6 py-6">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-foreground text-surface">
                <Users size={20} />
              </div>
              <p className="mt-4 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Individual Contribution
              </p>
              <p className="mt-1 text-center text-5xl font-black leading-none text-foreground">
                {formatNaira(individualWeeklyAmount)}
              </p>
              <p className="mt-2 text-center text-sm text-muted-foreground">Each member saves weekly</p>

              <div className="my-4 h-px w-full bg-border" />

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-foreground">{formatNaira(totalWeeklyGoal)}</p>
                  <p className="text-xs text-muted-foreground">Total Weekly Goal</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{values.memberCount} Members</p>
                  <p className="text-xs text-muted-foreground">Squad Size</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-dashed border-border bg-surface px-3 py-4 text-center text-xs text-muted-foreground">
                <Users size={16} className="mx-auto mb-2" />
                Shared Progress Tracking
              </div>
              <div className="rounded-3xl border border-border bg-accent-foreground px-3 py-4 text-center text-xs font-semibold text-surface">
                <BadgeCheck size={16} className="mx-auto mb-2" />
                Guaranteed Pay-outs
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-3xl bg-accent-foreground text-surface hover:bg-accent-foreground/90"
            >
              <span className="font-semibold">Next Step</span>
              <ArrowRight size={18} />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              You can adjust squad size later before final activation.
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
}