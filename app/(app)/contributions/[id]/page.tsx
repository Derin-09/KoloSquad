"use client";

import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
import { supabase } from "@/lib/supabase/client";

export default function ContributionDetails({ params }: { params: { id: string } }) {
  const [plans, setPlans] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [totalSaved, setTotalSaved] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      const squadId = params.id;
      console.log("Fetching data for squad:", squadId);

      // Fetch contribution plans
      const { data: plansData, error: plansError } = await supabase
        .from("contribution_plans")
        .select("id, amount, frequency, type, start_date, end_date, next_due_date")

        // .select("id, name, target_amount")
        // .eq("squad_id", squadId);

      if (plansError) console.error("Error fetching plans:", plansError);
      else {
        console.log("Plans data:", plansData);
        setPlans(plansData || []);
      }

      // Fetch contributions
      const { data: contribData, error: contribError } = await supabase
        .from("contributions")
        .select("amount, status, created_at")
        .eq("squad_id", squadId)
        .order("created_at", { ascending: false });

      if (contribError) console.error("Error fetching contributions:", contribError);
      else {
        console.log("Contributions data:", contribData);
        setContributions(contribData || []);

        const total = (contribData || [])
          .filter((c) => c.status === "success")
          .reduce((sum, c) => sum + Number(c.amount || 0), 0);

        setTotalSaved(total);
      }
    }

    fetchData();
  }, [params.id]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Squad Contributions</h1>

      {plans.length > 0 && (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="p-4 border rounded-md">
              <p className="font-medium">{plan.name}</p>
              <p className="text-sm text-muted-foreground">
                Target: ₦{plan.target_amount?.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="pt-8 border-t">
        <h2 className="text-xl font-semibold">Total Saved</h2>
        <p className="text-lg font-medium">₦{totalSaved.toLocaleString()}</p>
      </div>

      <div className="pt-6">
        <h2 className="text-xl font-semibold">Contribution History</h2>
        {contributions.length === 0 ? (
          <p>No contributions yet.</p>
        ) : (
          <div className="space-y-3">
            {contributions.map((c, i) => (
              <div key={i} className="p-3 border rounded-md">
                <p>₦{c.amount}</p>
                <p className="text-sm text-muted-foreground">
                  {c.status} — {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}













// "use client";

// import { useEffect, useState } from "react";
// // import { supabase } from "@/lib/supabaseClient";
// import { supabase } from "@/lib/supabase/client";

// export default function Page({ params }: { params: { id: string } }) {
//   const [plans, setPlans] = useState<any[]>([]);
//   const [contributions, setContributions] = useState<any[]>([]);
//   const [totalSaved, setTotalSaved] = useState<number>(0);

//   useEffect(() => {
//     async function fetchData() {
//       const squadId = params.id;
//       console.log("Fetching for squad:", squadId);

//       // Fetch contribution plans
//       const { data: plansData, error: plansError } = await supabase
//         .from("contribution_plans")
//         .select("id, name, target_amount")
//         .eq("squad_id", squadId);

//       if (plansError) console.error("Error fetching plans:", plansError);
//       else {
//         console.log("Plans data:", plansData);
//         setPlans(plansData || []);
//       }

//       // Fetch contributions (history)
//       const { data: contribData, error: contribError } = await supabase
//         .from("contributions")
//         .select("amount, status, created_at")
//         .eq("squad_id", squadId)
//         .order("created_at", { ascending: false });

//       if (contribError) console.error("Error fetching contributions:", contribError);
//       else {
//         console.log("Contributions data:", contribData);
//         setContributions(contribData || []);

//         // Calculate total saved
//         const total = (contribData || [])
//           .filter((c) => c.status === "success")
//           .reduce((sum, c) => sum + Number(c.amount || 0), 0);

//         setTotalSaved(total);
//       }
//     }

//     fetchData();
//   }, [params.id]);

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-semibold">Contribution Plans</h1>

//       {plans.length === 0 ? (
//         <p>No contribution plans yet.</p>
//       ) : (
//         <div className="space-y-4">
//           {plans.map((plan) => (
//             <div key={plan.id} className="p-4 border rounded-md">
//               <p className="font-medium">{plan.name}</p>
//               <p className="text-sm text-muted-foreground">
//                 Target: ₦{plan.target_amount?.toLocaleString()}
//               </p>
//             </div>
//           ))}
//         </div>
//       )}

//       <div className="pt-8">
//         <h2 className="text-xl font-semibold">Total Saved</h2>
//         <p className="text-lg">₦{totalSaved.toLocaleString()}</p>
//       </div>

//       <div className="pt-6">
//         <h2 className="text-xl font-semibold">Contribution History</h2>
//         {contributions.length === 0 ? (
//           <p>No contributions yet.</p>
//         ) : (
//           <div className="space-y-3">
//             {contributions.map((c, i) => (
//               <div key={i} className="p-3 border rounded-md">
//                 <p>₦{c.amount}</p>
//                 <p className="text-sm text-muted-foreground">
//                   {c.status} — {new Date(c.created_at).toLocaleDateString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
