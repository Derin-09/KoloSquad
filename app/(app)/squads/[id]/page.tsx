"use client";

import React, { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import NewContributionPlan from "../../contributions/[id]/new/page";

export default function SquadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: squadId } = use(params);

  const [squad, setSquad] = useState<any>(null);
  // const [plans, setPlans] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [totalSaved, setTotalSaved] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      // 🟣 Fetch squad info
      const { data: squadData, error: squadError } = await supabase
        .from("squads")
        .select("id, name, target_amount, invite_code, created_by")
        .eq("id", squadId)
        .single();

      if (squadError) console.error("Squad fetch error:", squadError);
      setSquad(squadData);

      // 🧑‍🤝‍🧑 Fetch members
      const { data: membersData, error: memberError } = await supabase
        .from("squad_members")
        .select("user_id, role, profiles(full_name, avatar_url)")
        .eq("squad_id", squadId);

      if (memberError) console.error("Member fetch error:", memberError);
      else setMembers(membersData || []);

      // 💰 Fetch contributions
      const { data: contribData } = await supabase
        .from("contributions")
        .select("amount, status, created_at")
        .eq("squad_id", squadId)
        .order("created_at", { ascending: false });

      const total =
        contribData
          ?.filter((c) => c.status === "successful")
          .reduce((sum, c) => sum + c.amount, 0) || 0;
      setContributions(contribData || []);
      setTotalSaved(total);
    }

    fetchData();
  }, [squadId]);

  if (!squad) {
    return <p className="p-6 text-center text-muted-foreground">Loading squad...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-12">
      {/* 🌟 Squad Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight capitalize">{squad.name}</h1>
          <p className="text-muted-foreground">
            🎯 Target: ₦{(squad.target_amount ?? 0).toLocaleString()} &nbsp;|&nbsp; 💰 Saved: ₦
            {totalSaved.toLocaleString()}
          </p>
        </div>
        <Link
          href="/squads"
          className="text-sm text-[color:var(--accent-button)] hover:underline"
        >
          ← Back
        </Link>
      </header>

      {/* 🔗 Invite Code */}
      <section className="rounded-2xl bg-[color:var(--accent-muted)] p-5 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">Invite Code</h3>
          <p className="text-muted-foreground text-sm">Share this with friends to join</p>
        </div>
        <code className="font-mono text-lg tracking-widest bg-white/10 px-4 py-2 rounded-md">
          {squad.invite_code || "N/A"}
        </code>
      </section>

      {/* 🧑‍🤝‍🧑 Squad Members */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Squad Members</h2>
        {members.length === 0 ? (
          <p className="text-muted-foreground">No members yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {members.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-[color:var(--card)] px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <div className="w-10 h-10 rounded-full bg-[color:var(--accent-muted)] flex items-center justify-center text-sm font-medium">
                  {m.profiles?.full_name?.[0] || "?"}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {m.profiles?.full_name || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 💡 New Plan */}
      <section className="pt-2">
        <h2 className="text-xl font-semibold mb-3">Create a Contribution Plan</h2>
        <NewContributionPlan squadId={squadId} />
      </section>

      {/* 🧾 Contribution History */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Contribution History</h2>
        {contributions.length === 0 ? (
          <p className="text-muted-foreground">No contributions yet.</p>
        ) : (
          <div className="space-y-2">
            {contributions.map((c, i) => (
              <div
                key={i}
                className="rounded-xl bg-[color:var(--card)] px-4 py-3 flex justify-between items-center shadow-sm hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold text-sm">₦{c.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
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

// import React, { useEffect, useState, use } from "react";
// import { supabase } from "@/lib/supabase/client";
// import Link from "next/link";
// import NewContributionPlan from "../../contributions/[id]/new/page";

// export default function SquadPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id: squadId } = use(params);

//   const [squadName, setSquadName] = useState<string>("Loading...");
//   const [squadAmount, setSquadAmount] = useState<number>(0);
//   const [plans, setPlans] = useState<any[]>([]);
//   const [contributions, setContributions] = useState<any[]>([]);
//   const [totalSaved, setTotalSaved] = useState<number>(0);

//   useEffect(() => {
//     async function fetchData() {
//       // 🟣 Fetch squad info
//       const { data: squadData, error: squadError } = await supabase
//         .from("squads")
//         .select("name, target_amount")
//         .eq("id", squadId)
//         .single();

//       if (squadError) console.error("Error fetching squad:", squadError);
//       setSquadName(squadData?.name || "Unnamed Squad");
//       setSquadAmount(squadData?.target_amount || 0);

//       // 🪙 Fetch contribution plans
//       const { data: plansData, error: plansError } = await supabase
//         .from("contribution_plans")
//         .select("id, name, target_amount")
//         .eq("squad_id", squadId);

//       if (plansError) console.error("Error fetching plans:", plansError);
//       else setPlans(plansData || []);

//       // 📜 Fetch contributions
//       const { data: contribData, error: contribError } = await supabase
//         .from("contributions")
//         .select("amount, status, created_at")
//         .eq("squad_id", squadId)
//         .order("created_at", { ascending: false });

//       if (contribError) console.error("Error fetching contributions:", contribError);
//       else {
//         setContributions(contribData || []);
//         const total =
//           contribData
//             ?.filter((c) => c.status === "successful")
//             .reduce((sum, c) => sum + c.amount, 0) || 0;
//         setTotalSaved(total);
//       }
//     }

//     fetchData();
//   }, [squadId]);

//   return (
//       <div className="space-y-10 p-6">
//   {/* Squad Overview */}
//   <div className="border border-border rounded-xl p-6 bg-card shadow-sm">
//     <div className="flex justify-between items-center">
//       <div>
//         <h1 className="text-2xl font-semibold">{squadName}</h1>
//         <p className="text-sm text-muted-foreground">🎯 Target: ₦{squadAmount.toLocaleString()}</p>
//       </div>
//       <Link href="/squads" className="text-sm text-blue-600 hover:underline">
//         ← Back
//       </Link>
//     </div>
//   </div>

//   {/* Squad Members */}
//   <section>
//     <h2 className="text-xl font-semibold mb-3">Squad Members</h2>
//     <div className="border border-border rounded-xl p-4 bg-card">
//       {/* map through squad members once you fetch them */}
//       <p className="text-muted-foreground text-sm">No members yet.</p>
//     </div>
//   </section>

//   {/* Create Plan */}
//   <section>
//     <h2 className="text-xl font-semibold mb-3">Contribution Plan</h2>
//     <NewContributionPlan squadId={squadId} />
//   </section>

//   {/* Contribution Plans */}
//   {/* <section>
//     <h2 className="text-xl font-semibold mb-3">All Plans</h2>
//     <div className="space-y-3">
//       {plans.map((plan) => (
//         <div key={plan.id} className="border border-border rounded-xl p-4 bg-card flex justify-between">
//           <div>
//             <p className="font-medium">{plan.name || "Untitled Plan"}</p>
//             <p className="text-sm text-muted-foreground">
//               Target: ₦{(plan.target_amount ?? 0).toLocaleString()}
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   </section> */}

//   {/* Contribution History */}
//   <section>
//     <h2 className="text-xl font-semibold mb-3">Contribution History</h2>
//     {contributions.length === 0 ? (
//       <p className="text-muted-foreground">No contributions yet.</p>
//     ) : (
//       <div className="space-y-2">
//         {contributions.map((c, i) => (
//           <div
//             key={i}
//             className="border border-border rounded-xl p-4 flex justify-between bg-card"
//           >
//             <div>
//               <p className="font-medium">₦{c.amount.toLocaleString()}</p>
//               <p className="text-sm text-muted-foreground">
//                 {new Date(c.created_at).toLocaleString()}
//               </p>
//             </div>
//             <span
//               className={`px-3 py-1 rounded-full text-sm ${
//                 c.status === "successful"
//                   ? "bg-green-100 text-green-700"
//                   : "bg-yellow-100 text-yellow-700"
//               }`}
//             >
//               {c.status}
//             </span>
//           </div>
//         ))}
//       </div>
//     )}
//   </section>
// </div>









//     // <div className="space-y-10 p-6">
//     //   {/* 🔹 Header */}
//     //   <div className="flex justify-between items-center">
//     //     <div>
//     //       <h1 className="text-2xl font-semibold capitalize">{squadName}</h1>
//     //       <p className="text-sm text-muted-foreground">Squad Overview</p>
//     //     </div>
//     //     <Link href="/squads" className="text-sm text-blue-600 hover:underline">
//     //       ← Back to Squads
//     //     </Link>
//     //   </div>

//     //   {/* 🪙 New Plan Section */}
//     //   <section>
//     //     <h2 className="text-xl font-semibold mb-4">Create New Contribution Plan</h2>
//     //     <NewContributionPlan squadId={squadId} />
//     //   </section>

//     //   {/* 📦 Plans */}
//     //   <section>
//     //     <h2 className="text-xl font-semibold mb-3">Contribution Plans</h2>
//     //     {plans.length === 0 ? (
//     //       <p className="text-muted-foreground">No plans yet.</p>
//     //     ) : (
//     //       <div className="space-y-3">
//     //         {plans.map((plan) => (
//     //           <div
//     //             key={plan.id}
//     //             className="border border-border rounded-xl p-4 flex justify-between items-center"
//     //           >
//     //             <div>
//     //               <p className="font-medium">{plan.name}</p>
//     //               <p className="text-sm text-muted-foreground">
//     //                 Target: ₦{(plan.target_amount ?? 0).toLocaleString()} | Saved: ₦{totalSaved.toLocaleString()}
//     //                 {/* Target: ₦{squadAmount.target_amount.toLocaleString()} | Saved: ₦ */}
//     //                 {totalSaved.toLocaleString()}
//     //               </p>
//     //             </div>
//     //           </div>
//     //         ))}
//     //       </div>
//     //     )}
//     //   </section>

//     //   {/* 📜 History */}
//     //   <section>
//     //     <h2 className="text-xl font-semibold mb-3">Contribution History</h2>
//     //     {contributions.length === 0 ? (
//     //       <p className="text-muted-foreground">No contributions yet.</p>
//     //     ) : (
//     //       <div className="space-y-2">
//     //         {contributions.map((c, i) => (
//     //           <div
//     //             key={i}
//     //             className="border border-border rounded-xl p-4 flex justify-between items-center"
//     //           >
//     //             <div>
//     //               <p className="font-medium">₦{c.amount.toLocaleString()}</p>
//     //               <p className="text-sm text-muted-foreground">
//     //                 {new Date(c.created_at).toLocaleString()}
//     //               </p>
//     //             </div>
//     //             <span
//     //               className={`px-3 py-1 rounded-full text-sm ${
//     //                 c.status === "successful"
//     //                   ? "bg-green-100 text-green-700"
//     //                   : "bg-yellow-100 text-yellow-700"
//     //               }`}
//     //             >
//     //               {c.status}
//     //             </span>
//     //           </div>
//     //         ))}
//     //       </div>
//     //     )}
//     //   </section>
//     // </div>
//   );
// }













// "use client";
// import React, { useEffect, useState } from "react";
// import { use } from "react"; // ⬅️ import use() to unwrap the promise
// import { supabase } from "@/lib/supabase/client";
// import Link from "next/link";
// import NewContributionPlan from "../../contributions/[id]/new/page";

// export default function SquadPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id: squadId } = use(params); // ✅ unwrap promise here

//   const [plans, setPlans] = useState<any[]>([]);
//   const [contributions, setContributions] = useState<any[]>([]);
//   const [totalSaved, setTotalSaved] = useState<number>(0);

//   useEffect(() => {
//     async function fetchData() {
//       const { data: plansData, error: plansError } = await supabase
//         .from("contribution_plans")
//         .select("id, name, target_amount")
//         .eq("squad_id", squadId);

//         // setSquadName(squadData?.name || "Unnamed Squad");

//       if (plansError) console.error("Error fetching plans:", plansError);
//       else setPlans(plansData || []);

//       const { data: contribData, error: contribError } = await supabase
//         .from("contributions")
//         .select("amount, status, created_at")
//         .eq("squad_id", squadId)
//         .order("created_at", { ascending: false });

//       if (contribError) console.error("Error fetching contributions:", contribError);
//       else {
//         setContributions(contribData || []);
//         const total = contribData
//           ?.filter((c) => c.status === "successful")
//           .reduce((sum, c) => sum + c.amount, 0);
//         setTotalSaved(total || 0);
//       }
//     }

//     fetchData();
//   }, [squadId]);

//   return (
//     <div className="space-y-10 p-6">
//        <div className="flex justify-between items-center">
//          <div>
//            <h1 className="text-2xl font-semibold capitalize">{squadName}</h1>
//            <p className="text-sm text-muted-foreground">Squad Overview</p>
//          </div>
//          <Link
//           href="/squads"
//           className="text-sm text-blue-600 hover:underline"
//         >
//           ← Back to Squads
//         </Link>
//       </div>

//       {/* 🪙 New Plan Section */}
//       <section>
//         <h2 className="text-xl font-semibold mb-4">Create New Contribution Plan</h2>
//         <NewContributionPlan squadId={squadId} />
//       </section>

//       {/* 📦 Plans */}
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

//       {/* 📜 History */}
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












// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase/client";
// import NewContributionPlan from "@/app/(app)/contributions/[id]/new/page";
// import Link from "next/link";

// export default function SquadPage({ params }: { params: { id: string } }) {
//   const squadId = params?.id; // ✅ ensure defined
//   const [plans, setPlans] = useState<any[]>([]);
//   const [contributions, setContributions] = useState<any[]>([]);
//   const [totalSaved, setTotalSaved] = useState<number>(0);
//   const [squadName, setSquadName] = useState<string>("");

//   useEffect(() => {
//     if (!squadId) return;

//     async function fetchData() {
//       // 🏷️ Fetch squad details
//       const { data: squadData } = await supabase
//         .from("squads")
//         .select("name")
//         .eq("id", squadId)
//         .single();

//       setSquadName(squadData?.name || "Unnamed Squad");

//       // 💰 Fetch contribution plans
//       const { data: plansData, error: plansError } = await supabase
//         .from("contribution_plans")
//         .select("id, name, target_amount")
//         .eq("squad_id", squadId);

//       if (plansError) console.error("Error fetching plans:", plansError);
//       else setPlans(plansData || []);

//       // 📜 Fetch contributions
//       const { data: contribData, error: contribError } = await supabase
//         .from("contributions")
//         .select("amount, status, created_at")
//         .eq("squad_id", squadId)
//         .order("created_at", { ascending: false });

//       if (contribError) console.error("Error fetching contributions:", contribError);
//       else {
//         setContributions(contribData || []);
//         const total = contribData
//           ?.filter((c) => c.status === "successful")
//           .reduce((sum, c) => sum + (c.amount || 0), 0);
//         setTotalSaved(total || 0);
//       }
//     }

//     fetchData();
//   }, [squadId]);

//   return (
//     <div className="space-y-10 p-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-semibold capitalize">{squadName}</h1>
//           <p className="text-sm text-muted-foreground">Squad Overview</p>
//         </div>
//         <Link
//           href="/squads"
//           className="text-sm text-blue-600 hover:underline"
//         >
//           ← Back to Squads
//         </Link>
//       </div>

//       {/* 🪙 New Plan Section */}
//       <section>
//         <h2 className="text-xl font-semibold mb-4">Create New Contribution Plan</h2>
//         <NewContributionPlan squadId={squadId} />
//       </section>

//       {/* 📦 Plans */}
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

//       {/* 📜 History */}
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