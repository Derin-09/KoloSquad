"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function NewContributionPlan({ squadId }: { squadId: string }) {
  const [plan, setPlan] = useState<any>(null);
  const [frequency, setFrequency] = useState("weekly");
  const [amount, setAmount] = useState<number>(1000);
  const [type, setType] = useState("pooled");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);

  const createPlan = async () => {
    try {
      setError(null);
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
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

  if (!editMode && plan) {
    return (
      <div className="border border-border rounded-xl p-5 bg-card shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold capitalize">Contribution Plan</h3>
          <button
            onClick={() => setEditMode(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="text-sm space-y-1 text-muted-foreground">
          <p>💸 Type: {plan.type}</p>
          <p>📅 Frequency: {plan.frequency}</p>
          <p>🕓 Start: {plan.start_date}</p>
          <p>🏁 End: {plan.end_date}</p>
          <p>🎯 Amount: ₦{Number(plan.amount).toLocaleString()}</p>
        </div>
        <div>
          
                      <a
                        href={`/contribute?squadId=${squadId}`}
                        className="rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-2 py-1"
                      >
                        Contribute
                      </a>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-md mx-auto space-y-4 border border-border rounded-xl p-5 bg-card shadow-sm">
      <h1 className="text-xl font-semibold">Create Contribution Plan</h1>

      <label className="block text-sm font-medium">Frequency</label>
      <select
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
        className="w-full rounded-md border border-input px-3 py-2 bg-background"
      >
        <option value="weekly">Weekly</option>
        <option value="bi-weekly">Bi-Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <label className="block text-sm font-medium">Contribution Amount (₦)</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full rounded-md border border-input px-3 py-2 bg-background"
        placeholder="Enter amount"
      />

      <label className="block text-sm font-medium">Contribution Type</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full rounded-md border border-input px-3 py-2 bg-background"
      >
        <option value="pooled">Pooled Goal (Shared Target)</option>
        <option value="rotational">Rotational</option>
        <option value="personal">Personal</option>
      </select>

      <label className="block text-sm font-medium">Start Date</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full rounded-md border border-input px-3 py-2 bg-background"
      />

      <label className="block text-sm font-medium">End Date</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full rounded-md border border-input px-3 py-2 bg-background"
      />

      <button
        onClick={createPlan}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground px-3 py-2 rounded-md hover:brightness-95 transition"
      >
        {loading ? "Creating..." : "Create Plan"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
}


