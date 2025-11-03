"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import NewContributionPlan from "../../contributions/[id]/new/NewContributionClient";



type Squad = {
  id: string;
  name: string;
  target_amount: number;
  invite_code: string;
  created_by: string;
};



export default function NewSquadPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [createdSquad, setCreatedSquad] = useState<Squad | null>(null);

  const [target, setTarget] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [contribShow, setContribShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    }
  };

  if (!contribShow) {
  return (
    <main className="max-w-md mx-aut space-y-4">
      <h1 className="text-2xl font-bold">Create Squad</h1>

      <label className="block text-sm font-medium">Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Rent Gang"
        className="w-full rounded-md border-2 border-[color:var(--accent-input)] 
                   focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
      />

      <label className="block text-sm font-medium">Target (₦)</label>
      <input
        type="number"
        value={target}
        onChange={(e) => setTarget(Number(e.target.value))}
        className="w-full rounded-md border-2 border-[color:var(--accent-input)] 
                   focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
      />

      <button
        onClick={createSquad}
        disabled={loading || !name || target <= 0}
        className="w-full rounded-md bg-[color:var(--accent-button)] 
                   text-[color:var(--accent-foreground)] px-3 py-2 hover:brightness-95 text-sm"
      >
        {loading ? "Creating..." : "Create"}
      </button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </main>
  );
}



return (
  <>
    {createdSquad && <NewContributionPlan squadId={createdSquad.id} />}
  </>
);


}



// "use client";

// import { useState } from "react";
// import { supabase } from "@/lib/supabase/client";

// export default function NewSquadPage() {
//   const [name, setName] = useState("");
//   const [frequency, setFrequency] = useState("monthly");
//   const [amount, setAmount] = useState(1000);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const today = new Date().toISOString().split("T")[0];

//   const createSquad = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Sign in required.");

//       if (new Date(startDate) < new Date(today))
//         throw new Error("Start date cannot be before today.");
//       if (new Date(endDate) < new Date(startDate))
//         throw new Error("End date cannot be before start date.");

//       const { data: squad, error: squadError } = await supabase
//         .from("squads")
//         .insert({ name, created_by: user.id })
//         .select()
//         .single();

//       if (squadError) throw squadError;

//       await supabase
//         .from("squad_members")
//         .insert({ squad_id: squad.id, user_id: user.id, role: "owner" });

//       const { error: planError } = await supabase
//         .from("contribution_plans")
//         .insert({
//           squad_id: squad.id,
//           created_by: user.id,
//           frequency,
//           amount,
//           type: "pooled",
//           start_date: startDate,
//           end_date: endDate,
//           next_due_date: startDate,
//           approvals: [user.id],
//           status: "pending",
//         });

//       if (planError) throw planError;

//       alert("Squad created successfully! Members must approve the plan.");
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Failed to create squad.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto border border-border rounded-xl p-6 bg-card shadow-md space-y-4">
//       <h1 className="text-xl font-semibold">Create New Squad</h1>

//       <label className="block text-sm font-medium">Squad Name</label>
//       <input
//         type="text"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         className="w-full rounded-md border border-input px-3 py-2 bg-background"
//         placeholder="Enter squad name"
//       />

//       <h2 className="font-semibold mt-6 text-lg">Initial Contribution Plan</h2>

//       <label className="block text-sm font-medium">Frequency</label>
//       <select
//         value={frequency}
//         onChange={(e) => setFrequency(e.target.value)}
//         className="w-full rounded-md border border-input px-3 py-2 bg-background"
//       >
//         <option value="weekly">Weekly</option>
//         <option value="bi-weekly">Bi-Weekly</option>
//         <option value="monthly">Monthly</option>
//       </select>

//       <label className="block text-sm font-medium">Amount (₦)</label>
//       <input
//         type="number"
//         value={amount}
//         onChange={(e) => setAmount(Number(e.target.value))}
//         className="w-full rounded-md border border-input px-3 py-2 bg-background"
//       />

//       <div className="flex gap-4">
//         <div className="flex-1">
//           <label className="block text-sm font-medium">Start Date</label>
//           <input
//             type="date"
//             min={today}
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="w-full rounded-md border border-input px-3 py-2 bg-background"
//           />
//         </div>
//         <div className="flex-1">
//           <label className="block text-sm font-medium">End Date</label>
//           <input
//             type="date"
//             min={startDate || today}
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="w-full rounded-md border border-input px-3 py-2 bg-background"
//           />
//         </div>
//       </div>

//       <button
//         onClick={createSquad}
//         disabled={loading}
//         className="w-full rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-3 py-2 hover:brightness-95 text-sm"
//       >
//         {loading ? "Creating..." : "Create Squad & Plan"}
//       </button>

//       {error && <p className="text-red-600 text-sm">{error}</p>}
//     </div>
//   );
// }







