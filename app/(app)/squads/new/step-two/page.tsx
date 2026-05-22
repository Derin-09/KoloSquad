"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { ArrowRight, BadgeCheck, CalendarDays, Gauge, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import {
  getSquadDraft,
  patchSquadDraft,
  type StepTwoDraftValues,
} from "@/app/(app)/squads/new/draft-storage";

export const initialStepTwoValues: StepTwoDraftValues = {
  mode: "hustle",
  frequency: "weekly",
};

const savingModes: Array<{
  id: StepTwoDraftValues["mode"];
  title: string;
  frequency: StepTwoDraftValues["frequency"];
  description: string;
  stat: string;
  icon: typeof CalendarDays;
  recommended?: boolean;
}> = [
  {
    id: "relaxed",
    title: "Relaxed",
    frequency: "yearly",
    description: "One contribution per year for ultra low-pressure saving.",
    stat: "1 Drop/Yr",
    icon: Gauge,
  },
  {
    id: "casual",
    title: "Casual",
    frequency: "monthly",
    description: "A relaxed pace for long-term goals without pressure.",
    stat: "12 Drops/Yr",
    icon: CalendarDays,
  },
  {
    id: "hustle",
    title: "Hustle",
    frequency: "weekly",
    description: "The sweet spot. Build momentum with weekly squad drops.",
    stat: "52 Drops/Yr",
    icon: Zap,
    recommended: true,
  },
];

export default function StepTwo() {
  const router = useRouter();

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
            <p>Saving Frequency</p>
          </div>

          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full border border-border bg-muted">
            <div className="h-full w-[40%] rounded-full bg-accent-foreground" />
          </div>

          <div className="mt-6 space-y-2">
            <h1 className="text-3xl font-black leading-none text-foreground">Choose Saving Mode</h1>
            <p className="text-sm text-muted-foreground">
              Select how often your squad will contribute to the goal. You can change this later.
            </p>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-3">
              {savingModes.map((mode) => {
                const Icon = mode.icon;
                const active = values.mode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setFieldValue("mode", mode.id);
                      setFieldValue("frequency", mode.frequency);
                    }}
                    className={[
                      "relative rounded-4xl border-2 bg-surface p-4 text-left transition",
                      active
                        ? "border-accent-foreground shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                        : "border-border hover:border-accent",
                    ].join(" ")}
                  >
                    {mode.recommended && (
                      <span className="absolute right-3 top-0 -translate-y-1/2 rounded-full bg-accent-foreground px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-surface">
                        Recommended
                      </span>
                    )}
                    <div className="flex size-9 items-center justify-center rounded-full border border-border bg-muted text-foreground">
                      <Icon size={16} />
                    </div>
                    <h3 className="mt-3 text-2xl font-black leading-none text-foreground">{mode.title}</h3>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {mode.frequency}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">{mode.description}</p>
                    <div className="mt-5 flex items-center justify-between text-xs font-semibold text-foreground">
                      <span>{mode.stat}</span>
                      {active && <BadgeCheck size={15} className="text-accent-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-3xl px-8"
                onClick={() => router.push("/squads/new/step-one")}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="h-12 rounded-3xl bg-accent-foreground px-10 text-surface hover:bg-accent-foreground/90"
              >
                <span className="font-semibold">Next</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}