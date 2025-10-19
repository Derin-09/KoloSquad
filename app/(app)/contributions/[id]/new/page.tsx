"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NewContributionPlan({ squadId }: { squadId: string }) {
  const router = useRouter();
  const [frequency, setFrequency] = useState("weekly");
  const [amount, setAmount] = useState<number>(1000);
  const [type, setType] = useState("pooled");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const createPlan = async () => {
  try {
    setError(null);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sign in required");

    const { error: insertError } = await supabase.from("contribution_plans").insert({
      squad_id: squadId,
      user_id: user.id,
      frequency,
      amount,
      type,
      start_date: startDate,
      end_date: endDate,
      next_due_date: startDate,
    });

    if (insertError) throw insertError;

    const { data: totalContributed } = await supabase
      .from("contributions")
      .select("amount")
      .eq("squad_id", squadId);

    const { data: squad } = await supabase
      .from("squads")
      .select("target_amount")
      .eq("id", squadId)
      .single();

    const progress =
      (totalContributed?.reduce((sum, c) => sum + Number(c.amount), 0) || 0) /
      (squad?.target_amount || 1);

    console.log("Current progress:", progress);

    router.replace(`/squads/${squadId}`);
  } catch (e) {
    setError(e instanceof Error ? e.message : "Failed to create contribution plan");
  } finally {
    setLoading(false);
  }
};



  return (
    <main className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Create Contribution Plan</h1>

      <label className="block text-sm font-medium">Frequency</label>
      <select
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
        className="w-full rounded-md border-2 border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
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
        className="w-full rounded-md border-2 border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
        placeholder="Enter contribution amount"
      />

      <label className="block text-sm font-medium">Contribution Type</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full rounded-md border-2 border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
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
        className="w-full rounded-md border-2 border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
      />

      <label className="block text-sm font-medium">End Date</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full rounded-md border-2 border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none  px-3 py-2 transition-colors"
      />

      <button
        onClick={createPlan}
        disabled={loading || !amount || !frequency || !type || !startDate || !endDate}
        className="w-full rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-3 py-2 hover:brightness-95 text-sm"
      >
        {loading ? "Creating..." : "Create Plan"}
      </button>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </main>
  );
}













// import NewContributionPlan from "./[id]/new/page";

// export default function ContributionsPage() {
//   return (
//     <main className="space-y-6">
      
//       {/* <header className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl sm:text-2xl font-semibold">Contributions</h1>
//           <p className="text-sm opacity-70">Your recent and scheduled contributions.</p>
//         </div>
//         <a href="/squads/new" className="rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-3 py-2 hover:brightness-95 text-sm">New Squad</a>
//       </header>

//       <section className="card p-4">
//         <div className="flex items-center justify-between mb-3">
//           <h2 className="text-sm font-medium">Recent</h2>
//           <span className="badge-soft">Last 30 days</span>
//         </div>
//         <div className="text-sm opacity-70">
//           No contributions yet. When you start contributing to a squad, they&apos;ll show up here. <span> <a href="/contribute" className=" text-[color:var(--accent)] hover:brightness-95 text-sm">Contribute</a></span>
//         </div>
//       </section>

//       <section className="card p-4">
//         <div className="flex items-center justify-between mb-3">
//           <h2 className="text-sm font-medium">Scheduled</h2>
//           <span className="badge-soft">Upcoming</span>
//         </div>
//         <div className="text-sm opacity-70">
//           You have no scheduled contributions.
//         </div>
//       </section> */}
//     </main>
//   );
// }
