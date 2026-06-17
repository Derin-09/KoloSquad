"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { toast } from "sonner";
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
  const saved = getSquadDraft();


  const { values, setFieldValue, handleSubmit, setValues } = useFormik<StepTwoDraftValues>({
    initialValues: initialStepTwoValues,
    onSubmit: () => {
      patchSquadDraft({ currentStep: 3, stepTwo: values });
      console.log(saved?.stepTwo, 'saved')
      router.push("/squads/new/step-three");
    },
  });

  useEffect(() => {
    patchSquadDraft({ currentStep: 2, stepTwo: values });
  }, [values]);

  useEffect(() => {
    if (saved?.stepTwo) {
      setValues({ ...initialStepTwoValues, ...saved.stepTwo });
    }
  }, [setValues]);

  // Determine which modes are available based on Step 1 duration
  const getAvailableModes = () => {
    const duration = saved?.stepOne?.duration;
    if (duration === "week(s)") {
      return ["hustle"]; // Only weekly saving for week durations
    }
    if (duration === "month(s)") {
      return ["casual", "hustle"]; // No yearly for month durations
    }
    return ["relaxed", "casual", "hustle"]; // All available for year durations
  };

  const availableModes = getAvailableModes();

  const handleModeSelect = (modeId: StepTwoDraftValues["mode"]) => {
    if (!availableModes.includes(modeId)) {
      // Show toast with appropriate message
      const duration = saved?.stepOne?.duration;
      if (duration === "week(s)") {
        toast.error("You're only saving for weeks. Weekly Hustle is your only option for this duration.");
      } else if (duration === "month(s)" && modeId === "relaxed") {
        toast.error("You're only saving for months. Relaxed (yearly) isn't available for this duration.");
      }
      return;
    }
    setFieldValue("mode", modeId);
    setFieldValue("frequency", savingModes.find((m) => m.id === modeId)?.frequency || "weekly");
  };
  return (
    <main className="w-full px-8 py-2 sm:px-6 sm:py-3 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center">
        <div
        //   animated={false}
        //   hoverable={false}
        //   className="w-full max-w-130 rounded-4xl border-2 border-border bg-surface px-8 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.12)] sm:px-10 sm:py-9"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
            <p className="uppercase tracking-[0.12em] text-muted-foreground">Step 2 of 5</p>
            <p>Saving Frequency</p>
          </div>

          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full border border-border bg-muted">
            <div className="h-full w-[40%] rounded-full bg-accent" />
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
                const isDisabled = !availableModes.includes(mode.id);
                return (
                  <button
                   key={mode.id}
                    type="button"
                    onClick={() => handleModeSelect(mode.id)}
                    disabled={isDisabled}
                    className={[
                      "relative rounded-4xl border-2 bg-surface p-4 text-left transition",
                      isDisabled && "opacity-50 cursor-not-allowed",
                      active
                        ? "border-accent shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                        : "border-border hover:border-accent-foreground",
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
                //   </Card>
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

            
              {/* <Button
                type="submit"
                className="h-12 w-full bg-accent-foreground px-10 text-surface hover:bg-accent-foreground/90"
              >
                <span className="font-semibold">Next</span>
                <ArrowRight size={18} />
              </Button> */}
          </form>

        </div>
      </div>
    </main>
  );
}