"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import NewContributionPlan from "@/app/(app)/contributions/[id]/new/page";
import Link from "next/link";

export default function SquadPage({ params }: { params: { id: string } }) {
  const squadId = params?.id; // ✅ ensure defined
  const [plans, setPlans] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [totalSaved, setTotalSaved] = useState<number>(0);
  const [squadName, setSquadName] = useState<string>("");

  useEffect(() => {
    if (!squadId) return;

    async function fetchData() {
      // 🏷️ Fetch squad details
      const { data: squadData } = await supabase
        .from("squads")
        .select("name")
        .eq("id", squadId)
        .single();

      setSquadName(squadData?.name || "Unnamed Squad");

      // 💰 Fetch contribution plans
      const { data: plansData, error: plansError } = await supabase
        .from("contribution_plans")
        .select("id, name, target_amount")
        .eq("squad_id", squadId);

      if (plansError) console.error("Error fetching plans:", plansError);
      else setPlans(plansData || []);

      // 📜 Fetch contributions
      const { data: contribData, error: contribError } = await supabase
        .from("contributions")
        .select("amount, status, created_at")
        .eq("squad_id", squadId)
        .order("created_at", { ascending: false });

      if (contribError) console.error("Error fetching contributions:", contribError);
      else {
        setContributions(contribData || []);
        const total = contribData
          ?.filter((c) => c.status === "successful")
          .reduce((sum, c) => sum + (c.amount || 0), 0);
        setTotalSaved(total || 0);
      }
    }

    fetchData();
  }, [squadId]);

  return (
    <div className="space-y-10 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">{squadName}</h1>
          <p className="text-sm text-muted-foreground">Squad Overview</p>
        </div>
        <Link
          href="/squads"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Squads
        </Link>
      </div>

      {/* 🪙 New Plan Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Create New Contribution Plan</h2>
        <NewContributionPlan squadId={squadId} />
      </section>

      {/* 📦 Plans */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Contribution Plans</h2>
        {plans.length === 0 ? (
          <p className="text-muted-foreground">No plans yet.</p>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="border border-border rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Target: ₦{plan.target_amount.toLocaleString()} | Saved: ₦
                    {totalSaved.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 📜 History */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Contribution History</h2>
        {contributions.length === 0 ? (
          <p className="text-muted-foreground">No contributions yet.</p>
        ) : (
          <div className="space-y-2">
            {contributions.map((c, i) => (
              <div
                key={i}
                className="border border-border rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">₦{c.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    c.status === "successful"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}










// "use client";

// import { useEffect, useState } from "react";
// // import { supabase } from "@/lib/supabaseClient";
// import { supabase } from "@/lib/supabase/client";
// import NewContributionPlan from "../../contributions/[id]/new/page";
// // import NewContributionPlan from "../contributions/[id]/new/page";

// export default function Page({ params }: { params: { id: string } }) {
//   const [plans, setPlans] = useState<any[]>([]);
//   const [contributions, setContributions] = useState<any[]>([]);
//   const [totalSaved, setTotalSaved] = useState<number>(0);

//   useEffect(() => {
//     async function fetchData() {
//       const squadId = params.id;

//       // Fetch contribution plans for this squad
//       const { data: plansData, error: plansError } = await supabase
//         .from("contribution_plans")
//         .select("id, name, target_amount")
//         .eq("squad_id", squadId);

//       if (plansError) console.error("Error fetching plans:", plansError);
//       else setPlans(plansData || []);

//       // Fetch contributions (history)
//       const { data: contribData, error: contribError } = await supabase
//         .from("contributions")
//         .select("amount, status, created_at")
//         .eq("squad_id", squadId)
//         .order("created_at", { ascending: false });

//       if (contribError) console.error("Error fetching contributions:", contribError);
//       else {
//         setContributions(contribData || []);
//         // Calculate total saved (sum of successful contributions)
//         const total = contribData
//           ?.filter((c) => c.status === "successful")
//           .reduce((sum, c) => sum + c.amount, 0);
//         setTotalSaved(total || 0);
//       }
//     }

//     fetchData();
//   }, [params.id]);

//   return (
//     <div className="space-y-10 p-6">
//       {/* Section: New Plan */}
//       <section>
//         <h1 className="text-2xl font-semibold mb-4">Create New Contribution Plan</h1>
//         <NewContributionPlan squadId={params.id} />
//       </section>

//       {/* Section: Existing Plans */}
//       <section>
//         <h2 className="text-xl font-semibold mb-3">Contribution Plans</h2>
//         {plans.length === 0 ? (
//           <p className="text-muted-foreground">No plans yet.</p>
//         ) : (
//           <div className="space-y-3">
//             {plans.map((plan) => (
//               <div
//                 key={plan.id}
//                 className="border border-border rounded-xl p-4 flex justify-between items-center"
//               >
//                 <div>
//                   <p className="font-medium">{plan.name}</p>
//                   <p className="text-sm text-muted-foreground">
//                     Target: ₦{plan.target_amount.toLocaleString()} | Saved: ₦
//                     {totalSaved.toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* Section: Contribution History */}
//       <section>
//         <h2 className="text-xl font-semibold mb-3">Contribution History</h2>
//         {contributions.length === 0 ? (
//           <p className="text-muted-foreground">No contributions yet.</p>
//         ) : (
//           <div className="space-y-2">
//             {contributions.map((c, i) => (
//               <div
//                 key={i}
//                 className="border border-border rounded-xl p-4 flex justify-between items-center"
//               >
//                 <div>
//                   <p className="font-medium">₦{c.amount.toLocaleString()}</p>
//                   <p className="text-sm text-muted-foreground">
//                     {new Date(c.created_at).toLocaleString()}
//                   </p>
//                 </div>
//                 <span
//                   className={`px-3 py-1 rounded-full text-sm ${
//                     c.status === "successful"
//                       ? "bg-green-100 text-green-700"
//                       : "bg-yellow-100 text-yellow-700"
//                   }`}
//                 >
//                   {c.status}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }