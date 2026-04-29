"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { PlanType } from "@/types/types";
import { useRouter } from "next/navigation";

import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, differenceInWeeks, differenceInMonths } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * Minimal typed representation of Supabase user metadata we care about.
 * Adjust if your real user metadata shape differs.
 */
interface AuthUser {
  id: string;
  user_metadata?: {
    full_name?: string | null;
    avatar_url?: string | null;
  };
}

export default function NewContributionPlan({ squadId }: { squadId: string }) {
  const [plan, setPlan] = useState<PlanType | null>(null);
  const [frequency, setFrequency] = useState<"weekly" | "bi-weekly" | "monthly">(
    "weekly"
  );
  const [amount, setAmount] = useState<number>(1000);
  const [squadName, setSquadName] = useState<string>('');
  const [type, setType] = useState<"pooled" | "personal">("pooled");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);

  // typed user (no 'any')
  const [user, setUser] = useState<AuthUser | null>(null);

  // squad metadata used for auto-calculation
  const [squadTarget, setSquadTarget] = useState<number>(0);
  const [squadStartDate, setSquadStartDate] = useState<number>(0);
  const [squadEndDate, setSquadEndDate] = useState<number>(0);
  const [memberCount, setMemberCount] = useState<number>(1);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

  const router = useRouter();

  // ------------------ stable hooks & helpers (top-level) ------------------

  // Fetch logged-in user once
  useEffect(() => {
    let mounted = true;
    async function getUser() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        const u = data.user;
        if (!u) {
          setUser(null);
          return;
        }
        // cast to our AuthUser shape
        setUser({
          id: u.id,
          user_metadata: (u.user_metadata as AuthUser["user_metadata"]) ?? {},
        });
      } catch {
        if (mounted) setUser(null);
      }
    }
    getUser();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch contribution plan for squad (if exists)
  useEffect(() => {
    if (!squadId) return;
    let mounted = true;
    async function fetchPlan() {
      try {
        const { data, error } = await supabase
          .from("contribution_plans")
          .select("*")
          .eq("squad_id", squadId)
          .limit(1)
          .single();
        if (!mounted) return;
        if (error) {
          // no plan found or other issue — keep editMode true for creation
          // console.warn("No existing plan found", error);
          setPlan(null);
          setEditMode(true);
          return;
        }
        setPlan(data);
        // seed form fields from existing plan
        if (data) {
          setFrequency(data.frequency ?? "weekly");
          setAmount(Number(data.amount ?? 1000));
          setType(data.type ?? "pooled");
          setStartDate(data.start_date ?? "");
          setEndDate(data.end_date ?? "");
          setEditMode(false);
        }
      } catch (err) {
        // ignore fetch errors for now
        setPlan(null);
        setEditMode(true);
      }
    }
    fetchPlan();
    return () => {
      mounted = false;
    };
  }, [squadId]);

  // Fetch squad target + member count for calculations (always top-level)
  useEffect(() => {
    if (!squadId) return;
    let mounted = true;
    async function fetchSquadDetails() {
      try {
        const { data: squad } = await supabase
          .from("squads")
          .select("target_amount, name, start_date, end_date")
          .eq("id", squadId)
          .single();
        const { data: members } = await supabase
          .from("squad_members")
          .select("id")
          .eq("squad_id", squadId);

        if (!mounted) return;
          setSquadName(squad?.name);
          setSquadStartDate(squad?.start_date)
          setSquadEndDate(squad?.end_date)
        if (squad && typeof squad.target_amount === "number") {
          setSquadTarget(Number(squad.target_amount));
        } else if (squad && squad.target_amount != null) {
          // numeric might come as string
          setSquadTarget(Number(squad.target_amount));
        } else {
          setSquadTarget(0);
        }
        setMemberCount(Array.isArray(members) ? members.length : 1);
      } catch {
        if (mounted) {
          setSquadTarget(0);
          setMemberCount(1);
        }
      }
    }
    fetchSquadDetails();
    return () => {
      mounted = false;
    };
  }, [squadId]);

  // Recalculate estimated per-member payment whenever dates/frequency/target/members change
  useEffect(() => {
    if (!startDate || !endDate || !squadTarget || !memberCount) {
      setCalculatedAmount(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      setCalculatedAmount(0);
      return;
    }

    let periods = 1;
    if (frequency === "weekly") {
      periods = Math.max(1, differenceInWeeks(end, start));
    } else if (frequency === "bi-weekly") {
      periods = Math.max(1, Math.floor(differenceInWeeks(end, start) / 2));
    } else if (frequency === "monthly") {
      periods = Math.max(1, differenceInMonths(end, start));
    }

    const perMember = squadTarget / Math.max(1, memberCount) / Math.max(1, periods);
    setCalculatedAmount(perMember);
  }, [startDate, endDate, squadTarget, memberCount, frequency]);

  // ------------------ handlers that do not change hook order ------------------

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

  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const chosen = new Date(date);
    chosen.setHours(0, 0, 0, 0);
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      if (chosen < s) {
        alert("End date cannot be before start date.");
        return;
      }
    }
    setEndDate(chosen.toISOString().split("T")[0]);
  };

  // ------------------ data mutators (create/update/approve) ------------------

  const createPlan = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!user) throw new Error("Sign in required");

      const { data, error: insertError } = await supabase
        .from("contribution_plans")
        .insert({
          squad_id: squadId,
          created_by: user.id,
          frequency,
          amount,
          type,
          start_date: startDate,
          end_date: endDate,
          next_due_date: startDate,
          approvals: [],
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setPlan(data);
      setEditMode(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!user) throw new Error("Sign in required");
      if (!plan) throw new Error("No plan found");

      const { error: updateError } = await supabase
        .from("contribution_plans")
        .update({
          frequency,
          amount,
          type,
          start_date: startDate,
          end_date: endDate,
          approvals: [], // reset approvals on edit
          status: "pending",
        })
        .eq("id", plan.id);

      if (updateError) throw updateError;
      // refresh plan after update
      const { data } = await supabase
        .from("contribution_plans")
        .select("*")
        .eq("id", plan.id)
        .single();
      setPlan(data);
      setEditMode(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update plan");
    } finally {
      setLoading(false);
    }
  };

  const approvePlan = async (candidatePlan: PlanType) => {
    try {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;
      if (!currentUser) throw new Error("Sign in required");

      const updatedApprovals = candidatePlan.approvals?.includes(currentUser.id)
        ? candidatePlan.approvals
        : [...(candidatePlan.approvals || []), currentUser.id];

      await supabase
        .from("contribution_plans")
        .update({ approvals: updatedApprovals })
        .eq("id", candidatePlan.id);

      // Fetch squad members
      const { data: members } = await supabase
        .from("squad_members")
        .select("user_id")
        .eq("squad_id", candidatePlan.squad_id);

      const allMemberIds = members?.map((m: { user_id: string }) => m.user_id) || [];
      const allApproved = allMemberIds.every((id) => updatedApprovals.includes(id));

      if (allApproved) {
        await supabase
          .from("contribution_plans")
          .update({ status: "approved" })
          .eq("id", candidatePlan.id);
      }

      // refresh plan
      const { data: refreshed } = await supabase
        .from("contribution_plans")
        .select("*")
        .eq("id", candidatePlan.id)
        .single();
      setPlan(refreshed);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------ UI ------------------

  // VIEW: existing plan
  if (!editMode && plan) {
    const approvedCount = plan.approvals?.length || 0;

    return (
      <div className="border border-white/10 bg-[color:var(--accent)]/20 rounded-2xl p-6 shadow-[0_0_25px_-10px_rgba(0,0,0,0.4)] backdrop-blur-md space-y-4 transition-all hover:shadow-[0_0_35px_-8px_var(--accent-button)]">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              {/* Contribution Plan */}
              { squadName }
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of your current savings schedule
            </p>
          </div>

          {user?.id === plan.created_by && (
            <button
              onClick={() => setEditMode(true)}
              className="text-sm font-medium text-[color:var(--accent-button)] hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 text-sm text-muted-foreground pt-3">
          <p>
            <span className="font-medium text-foreground">Type:</span> {plan.type}
          </p>
          <p>
            <span className="font-medium text-foreground">Frequency:</span>{" "}
            {plan.frequency}
          </p>
          {/* <p>
            <span className="font-medium text-foreground">Start:</span>{" "}
            {format(new Date(squadStartDate), "PPP")}

          </p>
          <p>
            <span className="font-medium text-foreground">End:</span>{" "}
            {format(new Date(squadEndDate), "PPP")}

          </p> */}
          <p className="col-span-2 sm:col-span-1">
            <span className="font-medium text-foreground">Amount:</span> 
            {/* ₦{Number(plan.amount).toLocaleString()} */}
            ₦{Number(squadTarget).toLocaleString()}
          </p>
          <p className="col-span-2 sm:col-span-1">
            <span className="font-medium text-foreground">Weekly amount per member:</span> 
          ₦{Math.round(calculatedAmount).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4">
          <a
            href={`/contribute?squadId=${squadId}`}
            className="inline-block rounded-lg bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-4 py-2 font-medium text-sm tracking-wide hover:opacity-90 transition"
          >
            Make Contribution
          </a>

          {plan.status === "pending" && (
            <button
              onClick={() => approvePlan(plan)}
              className="rounded-lg bg-green-600 text-white px-4 py-2 font-medium text-sm tracking-wide hover:opacity-90 hover:cursor-pointer transition"
            >
              Approve Plan
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {approvedCount} members approved
          </p>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              plan.status === "approved"
                ? "bg-green-500/20 text-green-600"
                : "bg-yellow-500/20 text-yellow-600"
            }`}
          >
            {plan.status}
          </span>
        </div>
      </div>
    );
  }

  // CREATE / EDIT form
  return (
    <main className="max-w-md mx-auto space-y-4 border border-border rounded-xl p-5 bg-card shadow-sm">
      <h1 className="text-xl font-semibold">
        {plan ? "Edit Contribution Plan" : "Create Contribution Plan"}
      </h1>

      <label className="block text-sm font-medium">Frequency</label>
      <select
        value={frequency}
        onChange={(e) =>
          setFrequency(e.target.value as "weekly" | "bi-weekly" | "monthly")
        }
        className="w-full rounded-md border border-input px-3 py-2 bg-background"
      >
        <option value="weekly">Weekly</option>
        <option value="bi-weekly">Bi-Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <div className="grid grid-cols-2 gap-4">
        <div>
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(new Date(endDate), "PPP") : "Pick an end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate ? new Date(endDate) : undefined}
                onSelect={handleEndDateSelect}
                disabled={(date) =>
                  startDate ? date < new Date(startDate) : false
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="pt-4 text-sm text-muted-foreground">
        <p>
          Squad Target:{" "}
          <span className="text-foreground font-medium">
            ₦{squadTarget.toLocaleString()}
          </span>
        </p>
        <p>
          Members:{" "}
          <span className="text-foreground font-medium">{memberCount}</span>
        </p>
        {calculatedAmount > 0 && (
          <p>
            Estimated Per-Member {frequency} Payment:{" "}
            <span className="text-foreground font-semibold">
              ₦{Math.round(calculatedAmount).toLocaleString()}
            </span>
          </p>
        )}
      </div>

      <button
        onClick={plan ? updatePlan : createPlan}
        disabled={loading}
        className="w-full rounded-md bg-[color:var(--accent-button)] 
                   text-[color:var(--accent-foreground)] px-3 py-2 hover:brightness-95 text-sm"
      >
        {loading
          ? "Saving..."
          : plan
          ? "Update Plan (Resets Approvals)"
          : "Create Plan"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
}


