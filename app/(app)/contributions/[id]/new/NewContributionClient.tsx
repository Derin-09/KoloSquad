"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { PlanType } from "@/types/types";
import { useRouter } from "next/navigation";

export default function NewContributionPlan({ squadId }: { squadId: string }) {
  const [plan, setPlan] = useState<PlanType | null>(null);
  const [frequency, setFrequency] = useState("weekly");
  const [amount, setAmount] = useState<number>(1000);
  const [type, setType] = useState("pooled");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Fetch logged-in user
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    getUser();
  }, []);

  // Fetch plan for squad
  async function fetchPlan() {
    const { data, error } = await supabase
      .from("contribution_plans")
      .select("*")
      .eq("squad_id", squadId)
      .limit(1)
      .single();

    if (error) {
      console.warn("No existing plan found");
      return;
    }

    if (data) {
      setPlan(data);
      setEditMode(false);
    }
  }

  useEffect(() => {
    fetchPlan();
  }, [squadId]);

  // Create a new plan
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

  // Update plan (owner only)
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
          approvals: [],
          status: "pending",
        })
        .eq("id", plan.id);

      if (updateError) throw updateError;
      await fetchPlan();
      setEditMode(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update plan");
    } finally {
      setLoading(false);
    }
  };

  // Member approval function
  const approvePlan = async (plan: PlanType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");

      // Prevent duplicate approvals
      const updatedApprovals = plan.approvals?.includes(user.id)
        ? plan.approvals
        : [...(plan.approvals || []), user.id];

      await supabase
        .from("contribution_plans")
        .update({ approvals: updatedApprovals })
        .eq("id", plan.id);

      // Fetch all squad members
      const { data: members } = await supabase
        .from("squad_members")
        .select("user_id")
        .eq("squad_id", plan.squad_id);

      const allMemberIds = members?.map((m) => m.user_id) || [];
      const allApproved = allMemberIds.every((id) =>
        updatedApprovals.includes(id)
      );

      if (allApproved) {
        await supabase
          .from("contribution_plans")
          .update({ status: "approved" })
          .eq("id", plan.id);
      }

      await fetchPlan();
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------- UI -----------------------
  if (!editMode && plan) {
    const approvedCount = plan.approvals?.length || 0;

    return (
      <div className="border border-white/10 bg-[color:var(--accent)]/20 rounded-2xl p-6 shadow-[0_0_25px_-10px_rgba(0,0,0,0.4)] backdrop-blur-md space-y-4 transition-all hover:shadow-[0_0_35px_-8px_var(--accent-button)]">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Contribution Plan
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
          <p>
            <span className="font-medium text-foreground">Start:</span>{" "}
            {new Date(plan.start_date).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium text-foreground">End:</span>{" "}
            {new Date(plan.end_date).toLocaleDateString()}
          </p>
          <p className="col-span-2 sm:col-span-1">
            <span className="font-medium text-foreground">Amount:</span> ₦
            {Number(plan.amount).toLocaleString()}
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

  // ---------------- CREATE/EDIT FORM ----------------
  return (
    <main className="max-w-md mx-aut space-y-4 border border-border rounded-xl p-5 bg-card shadow-sm">
      <h1 className="text-xl font-semibold">
        {plan ? "Edit Contribution Plan" : "Create Contribution Plan"}
      </h1>

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
      />

      <label className="block text-sm font-medium">Contribution Type</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full rounded-md border border-input px-3 py-2 bg-background"
      >
        <option value="pooled">Pooled Goal (Shared Target)</option>
        <option value="personal">Personal</option>
      </select>

      <div className="md:flex gap-4 w-full">
        <div className="space-y-4 flex-1">
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-input px-3 py-2 bg-background"
          />
        </div>
        <div className="space-y-4 flex-1">
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md border border-input px-3 py-2 bg-background"
          />
        </div>
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













// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase/client";
// import { PlanType } from "@/types/types";
// import { useRouter } from "next/navigation";

// export default function NewContributionPlan({ squadId }: { squadId: string }) {
//   const [plan, setPlan] = useState<PlanType | null>(null);
//   const [frequency, setFrequency] = useState("weekly");
//   const [amount, setAmount] = useState<number>(1000);
//   const [type, setType] = useState("pooled");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [editMode, setEditMode] = useState(true);
//   const router = useRouter()


//   useEffect(() => {
//   async function fetchPlan() {
//     const { data, error } = await supabase
//       .from("contribution_plans")
//       .select("*")
//       .eq("squad_id", squadId)
//       .single();

//     if (data) {
//       setPlan(data);
//       setEditMode(false); 
//     }
//   }

//   fetchPlan();
// }, [squadId]);


//   const createPlan = async () => {
//     try {
//       setError(null);
//       setLoading(true);

//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) throw new Error("Sign in required");

//       const { data, error: insertError } = await supabase
//         .from("contribution_plans")
//         .insert({
//           squad_id: squadId,
//           created_by: user.id,
//           frequency,
//           amount,
//           type,
//           start_date: startDate,
//           end_date: endDate,
//           next_due_date: startDate,
//         })
//         .select()
//         .single();

//       if (insertError) throw insertError;
//       setPlan(data);
//       router.push(`squads/${squadId}`)
//       // setEditMode(false);
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Failed to create plan");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!editMode && plan) {
//     return (
//       <div className="border border-white/10 bg-[color:var(--accent)]/20 rounded-2xl p-6 shado\w-[0_0_25px_-10px_rgba(0,0,0,0.4)] backdro\p-blur-md space-y-4 transition-all hover:sh]adow-[0_0_35px_-8px_var(--accent-button)]">
//         <div className="flex justify-between items-start">
//           <div>
//             <h3 className="text-xl font-semibold tracking-tight text-foreground">
//               Contribution Plan
//             </h3>
//             <p className="text-sm text-muted-foreground mt-1">
//               Overview of your current savings schedule
//             </p>
//           </div>
//           <button
//             onClick={() => setEditMode(true)}
//             className="text-sm font-medium text-[color:var(--accent-button)] hover:underline"
//           >
//             Edit
//           </button>
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 text-sm text-muted-foreground pt-3">
//           <p>
//             <span className="font-medium text-foreground">Type:</span> {plan.type}
//           </p>
//           <p>
//             <span className="font-medium text-foreground">Frequency:</span> {plan.frequency}
//           </p>
//           <p>
//             <span className="font-medium text-foreground">Start:</span>{" "}
//             {new Date(plan.start_date).toLocaleDateString()}
//           </p>
//           <p>
//             <span className="font-medium text-foreground">End:</span>{" "}
//             {new Date(plan.end_date).toLocaleDateString()}
//           </p>
//           <p className="col-span-2 sm:col-span-1">
//             <span className="font-medium text-foreground">Amount:</span>{" "}
//             ₦{Number(plan.amount).toLocaleString()}
//           </p>
//         </div>

//         <div className="pt-4">
//           <a
//             href={`/contribute?squadId=${squadId}`}
//             className="inline-block rounded-lg bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-4 py-2 font-medium text-sm tracking-wide hover:opacity-90 transition"
//           >
//             Make Contribution
//           </a>
//         </div>
//       </div>








//       // <div className="borde border-bordr bg-accent rounded-xl p-5 bg-card shadow-sm space-y-3">
//       //   <div className="flex justify-between items-center">
//       //     <h3 className="text-lg font-semibold capitalize">Contribution Plan</h3>
//       //     <button
//       //       onClick={() => setEditMode(true)}
//       //       className="text-sm text-blue-600 hover:underline"
//       //     >
//       //       Edit
//       //     </button>
//       //   </div>
//       //   <div className="text-sm space-y-1 text-muted-foreground">
//       //     <p>💸 Type: {plan.type}</p>
//       //     <p>📅 Frequency: {plan.frequency}</p>
//       //     <p>🕓 Start: {plan.start_date}</p>
//       //     <p>🏁 End: {plan.end_date}</p>
//       //     <p>🎯 Amount: ₦{Number(plan.amount).toLocaleString()}</p>
//       //   </div>
//       //   <div>
//       //     <a
//       //       href={`/contribute?squadId=${squadId}`}
//       //       className="rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-2 py-1"
//       //     >
//       //       Contribute
//       //     </a>
//       //   </div>
//       // </div>
//     );
//   }

//   return (
//     <main className="max-w-md mx-aut space-y-4 borde border-border rounded-xl p-5 bg-card shadow-sm">
//       <h1 className="text-xl font-semibold">Create Contribution Plan</h1>

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

//       <label className="block text-sm font-medium">Contribution Amount (₦)</label>
//       <input
//         type="number"
//         value={amount}
//         onChange={(e) => setAmount(Number(e.target.value))}
//         className="w-full rounded-md border border-input px-3 py-2 bg-background"
//         placeholder="Enter amount"
//       />

//       <label className="block text-sm font-medium">Contribution Type</label>
//       <select
//         value={type}
//         onChange={(e) => setType(e.target.value)}
//         className="w-full rounded-md border border-input px-3 py-2 bg-background"
//       >
//         <option value="pooled">Pooled Goal (Shared Target)</option>
//         {/* <option value="rotational">Rotational</option> */}
//         <option value="personal">Personal</option>
//       </select>


//       <div className="md:flex gap-4 w-full">
//         <div className="space-y-4 flex-1">
//           <label className="block text-sm font-medium">Start Date</label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="w-full rounded-md border border-input px-3 py-2 bg-background"
//           />
//         </div>
//         <div className="space-y-4 flex-1">
//           <label className="block text-sm font-medium">End Date</label>
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="w-full rounded-md border border-input px-3 py-2 bg-background"
//           />
//         </div>
//       </div>

//       <button
//         onClick={createPlan}
//         disabled={loading}
//         // className="w-full bg-primary text-primary-foreground px-3 py-2 rounded-md hover:brightness-95 transition"
//         className="w-full rounded-md bg-[color:var(--accent-button)] 
//                    text-[color:var(--accent-foreground)] px-3 py-2 hover:brightness-95 text-sm"
//       >
//         {loading ? "Creating..." : "Create Plan"}
//       </button>

//       {error && <p className="text-sm text-red-600">{error}</p>}
//     </main>
//   );
// }
