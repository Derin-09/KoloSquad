"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import NewContributionPlan from "../../contributions/[id]/new/NewContributionClient";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";



type Squad = {
  id: string;
  name: string;
  target_amount: number;
  invite_code: string;
  created_by: string;
};

const getStep = (value: number) => {
  if (value < 5000) return 1000
  if (value < 100000) return 10000
  return 100000
}


export default function NewSquadPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [createdSquad, setCreatedSquad] = useState<Squad | null>(null);
  const [duration, setDuration] = useState<"week(s)" | "month(s)" | "year(s)">(
    "week(s)"
  );;
  const [durationNumber, setDurationNumber] = useState<number>();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [target, setTarget] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [contribShow, setContribShow] = useState(false);
  const [dialogShow, setDialogShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState<number>(1)
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "yearly">(
    "weekly"
  );
  const handleStartDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const today = new Date();
    // reset time to midnight for comparison
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(date);
    chosen.setHours(0, 0, 0, 0);
    if (chosen < today) {
      // UI: you might want a nicer toast; kept alert for parity with original
      alert("Start date cannot be before today.");
      return;
    }
    setStartDate(chosen.toISOString().split("T")[0]);
  };


  useEffect(() => {
    if (startDate && duration) {
      const start = new Date(startDate);
      const calculatedEndDate = new Date(start);

      calculatedEndDate.setDate(start.getDate() + Number(duration));

      setEndDate(calculatedEndDate.toISOString());
    } else {
      setEndDate("");
    }
  }, [startDate, duration]);

  const createSquad = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");

      const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();

      const { data: squad, error: squadError } = await supabase
        .from("squads")
        .insert({
          name,
          target_amount: target,
          invite_code: inviteCode,
          created_by: user.id,
          duration,
          duration_number: durationNumber,
          member_count: memberCount,
          frequency
        })
        .select()
        .single();

      if (squadError) throw squadError;

      const { error: memberError } = await supabase.from("squad_members").insert({
        squad_id: squad.id,
        user_id: user.id,
        role: "owner",
      });

      if (memberError) throw memberError;

      const { error: planError } = await supabase.from("contribution_plans").insert({
        squad_id: squad.id,
        created_by: user.id,
        user_id: user.id,
        frequency: "weekly", // defaults
        amount: 1000,
        type: "pooled",
        start_date: new Date().toISOString().split("T")[0],
        next_due_date: new Date().toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0]
      });

      if (planError) throw planError;

      // router.replace(`/squads/${squad.id}`);
      // router.replace(`/contributions/${squad.id}/new`);
      setCreatedSquad(squad);
      setContribShow(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create squad");
    } finally {
      setLoading(false);
      setDialogShow(false)
      router.push(`/squads`)
      
    }
  };

  const calculatePeriods = () => {
    if (!durationNumber) return 1;

    if (frequency === "weekly") {
      if (duration === "week(s)") return durationNumber;
      if (duration === "month(s)") return durationNumber * 4;
      if (duration === "year(s)") return durationNumber * 52;
    }


    if (frequency === "monthly") {
      if (duration === "week(s)") return Math.ceil(durationNumber / 4);
      if (duration === "month(s)") return durationNumber;
      if (duration === "year(s)") return durationNumber * 12;
    }


    if (frequency === "yearly") {
      if (duration === "week(s)") return Math.floor(durationNumber / 52);
      if (duration === "month(s)") return Math.floor(durationNumber * 12);
      if (duration === "year(s)") return durationNumber;
    }

    return 1;
  };

  const periods = calculatePeriods();
  const calculatedAmount = target / memberCount / periods;

  if (!contribShow) {
    return (
      <main className="max-w-md mx-aut space-y-4">
        <h1 className="text-2xl font-bold">Create Squad</h1>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rent Gang"
            className="w-full rounded-md border-2 border-[color:var(--accent-input)] 
                   focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
          />
        </div>

        {/* <label className="block text-sm font-medium">Target (₦)</label>
      <input
        type="number"
        value={target}
        onChange={(e) => setTarget(Number(e.target.value))}
        className="w-full rounded-md border-2 border-[color:var(--accent-input)] 
                   focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
      /> */}

        <div className="space-y-2">
          <label className="block text-sm font-medium">Target (₦)</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setTarget((prev) => {
                  const next = prev - getStep(prev)
                  return next < 1000 ? 1000 : next
                })
              }
              className="px-3 py-2 rounded-md bg-muted hover:bg-accent transition-colors"
            >
              −
            </button>

            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full rounded-md border-2 border-[color:var(--accent-input)]
                 focus:border-[color:var(--accent-input-focus)] outline-none
                 px-3 py-2 text-center text-lg transition-colors"
            />

            <button
              type="button"
              onClick={() =>
                setTarget((prev) => prev + getStep(prev))
              }
              className="px-3 py-2 rounded-md bg-muted hover:bg-accent transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Number of members</label>
          <input
            type="number"
            placeholder="0"
            value={memberCount}
            onChange={(e) => setMemberCount(Number(e.target.value))}
            className="w-full rounded-md border-2 border-[color:var(--accent-input)]
                 focus:border-[color:var(--accent-input-focus)] outline-none
                 px-3 py-2 text-center text-lg transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Duration </label>
          <div className="grid grid-cols-2 py-2 gap-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Duration </label>
              <input
                value={durationNumber}
                onChange={(e) => setDurationNumber(Number(e.target.value))}
                placeholder="e.g. 3"
                type="number"
                className="w-full col-span-1 rounded-md border-2 border-[color:var(--accent-input)] 
                   focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Period </label>
              <select
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value as "week(s)" | "month(s)" | "year(s)")
                }
                className="w-full col-span-1 rounded-md border border-input px-3 py-2 bg-background"
              >
                <option value="week(s)">Week(s)</option>
                <option value="month(s)">Month(s)</option>
                <option value="year(s)">Year(s)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Frequency</label>
          <select
            value={frequency}
            onChange={(e) =>
              setFrequency(e.target.value as "weekly" | "yearly" | "monthly")
            }
            className="w-full rounded-md border border-input px-3 py-2 bg-background"
          >
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Bi-Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

        </div>


        {/* <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(new Date(startDate), "PPP") : "Pick a start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate ? new Date(startDate) : undefined}
                onSelect={handleStartDateSelect}
                disabled={(date) => {
                  const t = new Date();
                  t.setHours(0, 0, 0, 0);
                  return date < t;
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !endDate && "text-muted-foreground"
            )}
            disabled
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(new Date(endDate), "PPP") : "Calculated automatically"}
          </Button>
        </div> */}


        <button
          onClick={() => setDialogShow(true)}
          disabled={loading || !name || target <= 0}
          className="w-full rounded-md bg-[color:var(--accent-button)] 
                   text-[color:var(--accent-foreground)] px-3 py-2 hover:brightness-95 text-sm"
        >
          {loading ? "Creating..." : "Create"}
        </button>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
{/* 
        {dialogShow && (
          <div className="absolute w-screen h-screen flex justify-center items-center bg-black/30">
          <Dialog>
            <div className="border border-white/10 bg-[color:var(--accent)]/20 rounded-2xl p-6 shadow-[0_0_25px_-10px_rgba(0,0,0,0.4)] backdrop-blur-md space-y-4 transition-all hover:shadow-[0_0_35px_-8px_var(--accent-button)]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Before you create, review the overview of your savings schedule
                  </p>
                </div>

                <button
                  onClick={() => setDialogShow(false)}
                  className="text-sm font-medium text-[color:var(--accent-button)] hover:underline"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-y-3 text-sm text-muted-foreground pt-3 w-full">
  <p className="capitalize">
    <span className="font-medium text-foreground ">Frequency: </span> {frequency}
  </p>
  <p>
    <span className="font-medium text-foreground">Amount: </span>
    ₦{Number(target).toLocaleString()}
  </p>
  <p>
    <span className="font-medium text-foreground">Duration: </span> {durationNumber} {duration}
  </p>
  <p>
    <span className="font-medium text-foreground">Number of Members: </span> {memberCount}
  </p>
  <p>
    <span className="font-medium text-foreground">Weekly amount per member: </span>
    ₦{Math.round(calculatedAmount).toLocaleString()}
  </p>
</div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={createSquad}
                  className="inline-block rounded-lg bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-4 py-2 font-medium text-sm tracking-wide hover:opacity-90 transition"
                >
                  Submit
                </button>
              </div>


            </div>
          </Dialog>
          </div>
        )} */}


<Dialog open={dialogShow} onOpenChange={setDialogShow}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{name}</DialogTitle>
      <DialogDescription>
        Before you create, review the overview of your savings schedule
      </DialogDescription>
    </DialogHeader>

    <div className="grid grid-cols-2 gap-y-3 text-sm text-muted-foreground pt-3 w-full">
      <p className="capitalize">
        <span className="font-medium text-foreground">Frequency: </span> {frequency}
      </p>
      <p>
        <span className="font-medium text-foreground">Amount: </span>
        ₦{Number(target).toLocaleString()}
      </p>
      <p>
        <span className="font-medium text-foreground">Duration: </span> {durationNumber} {duration}
      </p>
      <p>
        <span className="font-medium text-foreground">Number of Members: </span> {memberCount}
      </p>
      <p>
        <span className="font-medium text-foreground">Weekly amount per member: </span>
        ₦{Math.round(calculatedAmount).toLocaleString()}
      </p>
    </div>

    <div className="flex items-center justify-between pt-4">
      <button
        onClick={createSquad}
        className="inline-block rounded-lg bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-4 py-2 font-medium text-sm tracking-wide hover:opacity-90 transition"
      >
        Submit
      </button>
      {/* <button
        onClick={() => setDialogShow(false)}
        className="text-sm font-medium text-[color:var(--accent-button)] hover:underline"
      >
        Cancel
      </button> */}
    </div>
  </DialogContent>
</Dialog>
      </main>
    );
  }



  // return (
  //   <>
  //     {createdSquad && <NewContributionPlan squadId={createdSquad.id} />}
  //   </>
  // );


}


