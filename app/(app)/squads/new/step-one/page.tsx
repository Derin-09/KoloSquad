"use client";

import { ArrowRight, CircleHelp, Users } from "lucide-react";
import { useFormik } from "formik";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  getSquadDraft,
  patchSquadDraft,
  type StepOneDraftValues,
} from "@/app/(app)/squads/new/draft-storage";


  export const initialStepOneValues: StepOneDraftValues = {
      squadName: "",
      goalAmount: "",
      duration: "month(s)",
      durationNumber: 6,
    }

export default function StepOne() {
    const router = useRouter()
  const {values, setFieldValue, handleChange, handleBlur, handleSubmit, setValues, isSubmitting} = useFormik<StepOneDraftValues>({
    initialValues: initialStepOneValues,
    onSubmit: () => {
      patchSquadDraft({ currentStep: 2, stepOne: values });
      router.push('/squads/new/step-two')
    },
  });

  const parsedGoalAmount = Number(values.goalAmount.replace(/[^0-9.]/g, ""));
  const isStepOneComplete =
    values.squadName.trim().length > 0 &&
    Number.isFinite(parsedGoalAmount) &&
    parsedGoalAmount > 0 &&
    values.durationNumber > 0 &&
    Boolean(values.duration);

  useEffect(() => {
    patchSquadDraft({ currentStep: 1, stepOne: values });
  }, [values]);

  useEffect(() => {
    const saved = getSquadDraft();

    if (saved?.stepOne) {
      setValues({ ...initialStepOneValues, ...saved.stepOne });
    }
  }, [setValues]);

  return (
    <main className="w-full px-8 py-2 sm:px-6 sm:py-3 lg:px-8">
      <div className="mx-auto flex  w-full max-w-3xl items-center justify-center">
        <Card
          animated={false}
          hoverable={false}
          className="w-full max-w-130 rounded-4xl border-2 border-border bg-surface px-8 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.12)] sm:px-10 sm:py-9"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.24em] text-muted-foreground">
                STEP 1 OF 5
              </p>
              <h1 className="mt-1 text-2xl font-black leading-none text-foreground sm:text-[2rem]">
                Create Squad
              </h1>
            </div>

            <div className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-border bg-muted text-accent-foreground">
              <Users size={22} strokeWidth={2.2} />
            </div>
          </div>

          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full border border-border bg-muted">
            <div className="h-full w-[20%] rounded-full bg-accent" />
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-xs md:text-sm font-semibold text-foreground">Squad Name</span>
              <input
                type="text"
                placeholder="e.g. Dream Vacation"
                name="squadName"
                value={values.squadName}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-sm border border-border bg-muted px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:bg-surface"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs md:text-sm font-semibold text-foreground">Goal Amount</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="₦ 0.00"
                name="goalAmount"
                value={values.goalAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-sm border border-border bg-muted px-3 py-3 text-sm font-semibold tracking-wide outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:bg-surface"
              />
            </label>

            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-foreground">Duration</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={1}
                  name="durationNumber"
                  value={values.durationNumber}
                  onChange={(e) => setFieldValue("durationNumber", Number(e.target.value) || 1)}
                  onBlur={handleBlur}
                  className="w-full rounded-sm border border-border bg-muted px-3 py-3 text-sm outline-none transition-colors focus:border-accent focus:bg-surface"
                />
                <Select
                  value={values.duration}
                  onValueChange={(value) =>
                    setFieldValue(
                      "duration",
                      value as StepOneDraftValues["duration"]
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week(s)">Week(s)</SelectItem>
                    <SelectItem value="month(s)">Month(s)</SelectItem>
                    <SelectItem value="year(s)">Year(s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-sm border border-border bg-muted px-3 py-3">
              <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <CircleHelp size={12} strokeWidth={2.4} />
              </div>
              <p className="text-[11px] md:text-sm leading-snug text-muted-foreground">
                Setting a realistic duration helps your squad stay motivated.
                Most squads reach their goals 20% faster when they save for 6
                months or more.
              </p>
            </div>

            <Button
              type="submit"
              disabled={!isStepOneComplete || isSubmitting}
              className="h-12 w-full rounded-sm bg-accent-foreground text-surface hover:bg-accent-foreground/90"
            >
              <span className="font-semibold">Next</span>
              <ArrowRight size={18} />
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
