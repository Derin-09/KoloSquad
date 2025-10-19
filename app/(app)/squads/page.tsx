"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import NewSquadPage from "./new/page";
import JoinSquadPage from "./join/page";

export default function SquadsPage() {
  const [squads, setSquads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  useEffect(() => {
    async function fetchSquads() {
      const { data, error } = await supabase.from("squads").select("id, name");
      if (error) console.error("Error fetching squads:", error);
      else setSquads(data || []);
    }

    fetchSquads();
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* Section 1: Your Squads List */}
      <div>
        <h1 className="text-2xl font-semibold mb-4">Your Squads</h1>

        {squads.length === 0 ? (
          <p className="text-muted-foreground">
            You’re not in any squads yet.
          </p>
        ) : (
          <div className="space-y-3">
            {squads.map((squad) => (
              <a
                key={squad.id}
                href={`/squads/${squad.id}`}
                className="block border border-border rounded-xl p-4 hover:bg-muted transition"
              >
                <p className="font-medium">{squad.name}</p>
                <p className="text-sm text-muted-foreground">
                  View contributions →
                </p>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Create/Join Tabs */}
      <div className="mt-10">
        <div className="flex gap-6 border-b border-border relative">
          {["create", "join"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "create" | "join")}
              className={`pb-2 text-lg font-medium transition-colors ${
                activeTab === tab
                  ? "text-purple-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "create" ? "Create Squad" : "Join Squad"}
            </button>
          ))}

          {/* Purple underline animation */}
          <motion.div
            className="absolute bottom-0 h-[2px] w-[50px] bg-purple-500"
            layoutId="underline"
            initial={false}
            animate={{
              left: activeTab === "create" ? "0%" : "15%",
              width: "10%",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>

        {/* Content area */}
        <div className="relative overflow-hidden min-h-[250px] mt-6">
          <AnimatePresence mode="wait">
            {activeTab === "create" ? (
              <motion.div
                key="create"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 30, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* <h2 className="text-xl font-semibold">Create a new squad</h2>
                <form className="space-y-3">
                  <input
                    type="text"
                    placeholder="Squad Name"
                    className="w-full border rounded-md p-2 bg-background"
                  />
                  <button className="bg-purple-500 text-white px-4 py-2 rounded-md">
                    Create
                  </button>
                </form> */}
                <NewSquadPage/>
              </motion.div>
            ) : (
              <motion.div
                key="join"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* <h2 className="text-xl font-semibold">Join an existing squad</h2>
                <form className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter squad code"
                    className="w-full border rounded-md p-2 bg-background"
                  />
                  <button className="bg-purple-500 text-white px-4 py-2 rounded-md">
                    Join
                  </button>
                </form> */}
                <JoinSquadPage/>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}












// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { supabase } from "@/lib/supabase/client";

// export default function SquadsPage() {
//   const [squads, setSquads] = useState<any[]>([]);

//   useEffect(() => {
//     async function fetchSquads() {
//       const { data, error } = await supabase.from("squads").select("id, name");
//       if (error) console.error("Error fetching squads:", error);
//       else setSquads(data || []);
//     }

//     fetchSquads();
//   }, []);

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-semibold">Your Squads</h1>
//         <div className="space-x-3">
//           <Link
//             href="/squads/new"
//             className="bg-primary text-white px-4 py-2 rounded-md hover:opacity-90"
//           >
//             New Squad
//           </Link>
//           <Link
//             href="/squads/join"
//             className="border border-border px-4 py-2 rounded-md hover:bg-muted"
//           >
//             Join Squad
//           </Link>
//         </div>
//       </div>

//       {squads.length === 0 ? (
//         <p className="text-muted-foreground">You’re not in any squads yet.</p>
//       ) : (
//         <div className="space-y-3">
//           {squads.map((squad) => (
//             <Link
//               key={squad.id}
//               href={`/squads/${squad.id}`}
//               className="block border border-border rounded-xl p-4 hover:bg-muted transition"
//             >
//               <p className="font-medium">{squad.name}</p>
//               <p className="text-sm text-muted-foreground">View contributions →</p>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }













// "use client";

// import { useEffect, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { supabase } from "@/lib/supabase/client";
// import JoinSquadPage from "./join/page";
// import NewSquadPage from "./new/page";

// interface Squad {
//   id: string;
//   name: string;
//   target_amount: number;
//   invite_code: string;
//   created_at: string;
//   members: {
//     id: string;
//     display_name: string;
//     role: string;
//     created_at: string;
//   }[];
// }

// export default function SquadsPage() {
//   const [activeTab, setActiveTab] = useState<"create" | "join">("create");
//   const [squads, setSquads] = useState<Squad[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         // 1️⃣ Get all squads
//         const { data: squadData, error: squadError } = await supabase
//           .from("squads")
//           .select("id, name, target_amount, invite_code, created_at");

//         if (squadError) throw squadError;

//         // 2️⃣ Get members (joined by squad_id)
//         const { data: memberData, error: memberError } = await supabase
//           .from("squad_members")
//           .select("id, display_name, role, created_at, squad_id");

//         if (memberError) throw memberError;

//         // 3️⃣ Group members by squad
//         const grouped = (squadData || []).map((squad) => ({
//           ...squad,
//           members: memberData?.filter((m) => m.squad_id === squad.id) || [],
//         }));

//         setSquads(grouped);
//       } catch (err) {
//         console.error("Fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <main className="p- md:p-6 space-y-6">
//       <h1 className="text-2xl sm:text-3xl font-bold">Your Squads</h1>

//       <div className="grid lg:grid-cols-[2fr,1fr] gap-2 md:gap-6">
//         {/* LEFT SECTION */}
//         <section className="space-y-6">
//           {loading ? (
//             <p className="text-sm opacity-70">Loading squads...</p>
//           ) : squads.length === 0 ? (
//             <p className="text-sm opacity-70">No squads yet. Create one!</p>
//           ) : (
//             squads.map((squad) => (
//               <div
//                 key={squad.id}
//                 className="rounded-2xl border border-[color:var(--accent-border)] p-4 backdrop-blur-sm bg-[color:var(--accent-bg)]/40"
//               >
//                 <div className="flex justify-between items-center mb-2">
//                   <h2 className="text-lg font-semibold">{squad.name}</h2>
//                   <span className="text-xs opacity-70">
//                     Created: {new Date(squad.created_at).toLocaleDateString()}
//                   </span>
//                 </div>

//                 <div className="text-sm mb-3">
//                   <p>
//                     🎯 Target: ₦{Number(squad.target_amount).toLocaleString()}
//                   </p>
//                   <p className="font-mono text-[color:var(--accent)]">
//                     Invite Code: {squad.invite_code}
//                   </p>
//                 </div>

//                 {squad.members.length > 0 ? (
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full text-sm border-collapse">
//                       <thead className="bg-[color:var(--accent-bg)]/60">
//                         <tr>
//                           <th className="px-3 py-2 text-left font-medium">Name</th>
//                           <th className="px-3 py-2 text-left font-medium">Role</th>
//                           <th className="px-3 py-2 text-left font-medium">Joined</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {squad.members.map((m) => (
//                           <tr
//                             key={m.id}
//                             className="border-t border-[color:var(--accent-border)]"
//                           >
//                             <td className="px-3 py-2 truncate">{m.display_name}</td>
//                             <td className="px-3 py-2 capitalize">{m.role}</td>
//                             <td className="px-3 py-2 text-xs opacity-70">
//                               {m.created_at
//                                 ? new Date(m.created_at).toLocaleDateString()
//                                 : "—"}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <p className="text-sm opacity-70">No members yet.</p>
//                 )}
//               </div>
//             ))
//           )}
//         </section>

//         {/* RIGHT SECTION — Create or Join */}
//         <section className="relative">
//           <div className="flex mb-4 gap-2 justify-end">
//             <button
//               onClick={() => setActiveTab("create")}
//               className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
//                 activeTab === "create"
//                   ? "bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)]"
//                   : "border border-[color:var(--accent-border)] opacity-70 hover:opacity-100"
//               }`}
//             >
//               Create Squad
//             </button>
//             <button
//               onClick={() => setActiveTab("join")}
//               className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
//                 activeTab === "join"
//                   ? "bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)]"
//                   : "border border-[color:var(--accent-border)] opacity-70 hover:opacity-100"
//               }`}
//             >
//               Join Squad
//             </button>
//           </div>

//           <div className="relative min-h-[400px] overflow-hidden rounded-2xl border border-[color:var(--accent-border)] p-4 bg-[color:var(--accent-bg)]/40 backdrop-blur-sm">
//             <AnimatePresence mode="wait">
//               {activeTab === "create" ? (
//                 <motion.div
//                   key="create"
//                   initial={{ opacity: 0, x: 40 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -40 }}
//                   transition={{ duration: 0.25 }}
//                 >
//                   <NewSquadPage />
//                 </motion.div>
//               ) : (
//                 <motion.div
//                   key="join"
//                   initial={{ opacity: 0, x: 40 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -40 }}
//                   transition={{ duration: 0.25 }}
//                 >
//                   <JoinSquadPage />
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }














// "use client";

// import { useEffect, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { supabase } from "@/lib/supabase/client";
// import JoinSquadPage from "./join/page";
// import NewSquadPage from "./new/page";
// // import NewSquadPage from "./new";
// // import JoinSquadPage from "./join";

// export default function SquadsPage() {
//   const [activeTab, setActiveTab] = useState<"create" | "join">("create");
//   const [squads, setSquads] = useState<any[]>([]);
//   const [members, setMembers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch squads and members when mounted
//   // useState(() => {
//   //   (async () => {
//   //     try {
//   //       setLoading(true);
//   //       const { data: squadData } = await supabase
//   //         .from("squads")
//   //         .select("id, name, target_amount, invite_code, created_at");

//   //       const { data: memberData } = await supabase
//   //         .from("squad_members")
//   //         .select("id, user_id, squad_id, role, joined_at");

//   //       setSquads(squadData || []);
//   //       setMembers(memberData || []);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   })();
//   // });

//   useEffect(() => {
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const { data: squadData, error: squadError } = await supabase
//         .from("squads")
//         .select("id, name, target_amount, invite_code, created_at");

//       // const { data: memberData, error: memberError } = await supabase
//       //   .from("squad_members")
//       //   .select("id, user_id, squad_id, role, created_at");

// //       const { data: memberData, error: memberError } = await supabase
// //   .from("squad_members")
// //   .select(`
// //     id,
// //     role,
// //     created_at,
// //     squads (name),
// //     user_id
// //   `);

// //   const { data: userData } = await supabase
// //   .from("profiles")
// //   .select("id, full_name");

// // const userMap = Object.fromEntries(userData.map(u => [u.id, u.full_name]));
// // setMembers(memberData.map(m => ({
// //   ...m,
// //   user_name: userMap[m.user_id] || "Unknown",
// // })));


// const { data: memberData, error: memberError } = await supabase
//   .from("squad_members")
//   .select("id, display_name, role, created_at, squad_id");

// if (memberError) throw memberError;

// setMembers(memberData ?? []);


//       if (squadError) throw squadError;
//       if (memberError) throw memberError;

//       setSquads(squadData || []);
//       setMembers(memberData || []);
//     } catch (err) {
//       console.error("Fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchData();
// }, []);

//   return (
//     <main className="p- md:p-6 space-y-6">
//       <h1 className="text-2xl sm:text-3xl font-bold">Your Squads</h1>

//       <div className="grid lg:grid-cols-[2fr,1fr] gap-2 md:gap-6">
//         {/* LEFT SECTION */}
//         <section className="space-y-6">
//           <div className="rounded-2xl border border-[color:var(--accent-border)] p-4 backdrop-blur-sm bg-[color:var(--accent-bg)]/40">
//             <h2 className="text-lg font-semibold mb-3">Squads Overview</h2>
//             {loading ? (
//               <p className="text-sm opacity-70">Loading squads...</p>
//             ) : squads.length > 0 ? (
//               <div className="overflow-x-auto rounded-lg">
//                 <table className="min-w-full text-sm border-collapse">
//                   <thead className="bg-[color:var(--accent-bg)]/60">
//                     <tr>
//                       <th className="px-3 py-2 text-left font-medium">Name</th>
//                       <th className="px-3 py-2 text-left font-medium">Target (₦)</th>
//                       <th className="px-3 py-2 text-left font-medium">Invite</th>
//                       <th className="px-3 py-2 text-left font-medium">Created</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {squads.map((s) => (
//                       <tr key={s.id} className="border-t border-[color:var(--accent-border)]">
//                         <td className="px-3 py-2">{s.name}</td>
//                         <td className="px-3 py-2">{Number(s.target_amount).toLocaleString()}</td>
//                         <td className="px-3 py-2 font-mono text-[color:var(--accent)]">{s.invite_code}</td>
//                         <td className="px-3 py-2 text-xs opacity-70">
//                           {new Date(s.created_at).toLocaleDateString()}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <p className="text-sm opacity-70">No squads yet. Create one!</p>
//             )}
//           </div>

//           <div className="rounded-2xl border border-[color:var(--accent-border)] p-4 backdrop-blur-sm bg-[color:var(--accent-bg)]/40 overflow-x-auto">
//   <h2 className="text-lg font-semibold mb-3">Members</h2>
//   {loading ? (
//     <p className="text-sm opacity-70">Loading members...</p>
//   ) : members.length > 0 ? (
//     <table className="min-w-full text-sm border-collapse">
//       <thead className="bg-[color:var(--accent-bg)]/60">
//         <tr>
//           <th className="px-3 py-2 text-left font-medium">Name</th>
//           <th className="px-3 py-2 text-left font-medium">Squad</th>
//           <th className="px-3 py-2 text-left font-medium">Role</th>
//           <th className="px-3 py-2 text-left font-medium">Joined</th>
//         </tr>
//       </thead>
//       <tbody>
//         {members.map((m) => (
//           <tr key={m.id} className="border-t border-[color:var(--accent-border)]">
//             {/* <td className="px-3 py-2 truncate">{m.user_name || "Unknown"}</td> */}
//             <td className="px-3 py-2 truncate">{m.display_name}</td>
//             <td className="px-3 py-2 truncate">{m.squads?.name || "—"}</td>
//             <td className="px-3 py-2 capitalize">{m.role}</td>
//             <td className="px-3 py-2 text-xs opacity-70">
//               {m.created_at ? new Date(m.created_at).toLocaleDateString() : "—"}
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   ) : (
//     <p className="text-sm opacity-70">No members yet.</p>
//   )}
// </div>


//           {/* <div className="rounded-2xl border border-[color:var(--accent-border)] p-4 backdrop-blur-sm bg-[color:var(--accent-bg)]/40">
//             <h2 className="text-lg font-semibold mb-3">Members</h2>
//             {loading ? (
//               <p className="text-sm opacity-70">Loading members...</p>
//             ) : members.length > 0 ? (
//               <div className="overflow-x-auto rounded-lg">
//                 <table className="min-w-full text-sm border-collapse">
//                   <thead className="bg-[color:var(--accent-bg)]/60">
//                     <tr>
//                       <th className="px-3 py-2 text-left font-medium">User ID</th>
//                       <th className="px-3 py-2 text-left font-medium">Squad ID</th>
//                       <th className="px-3 py-2 text-left font-medium">Role</th>
//                       <th className="px-3 py-2 text-left font-medium">Joined</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {members.map((m) => (
//                       <tr key={m.id} className="border-t border-[color:var(--accent-border)]">
//                         <td className="px-3 py-2 truncate">{m.user_id}</td>
//                         <td className="px-3 py-2 truncate">{m.squad_id}</td>
//                         <td className="px-3 py-2 capitalize">{m.role}</td>
//                         <td className="px-3 py-2 text-xs opacity-70">
//                           {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "—"}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <p className="text-sm opacity-70">No members yet.</p>
//             )}
//           </div> */}
//         </section>

//         {/* RIGHT SECTION — Create or Join */}
//         <section className="relative">
//           <div className="flex mb-4 gap-2 justify-end">
//             <button
//               onClick={() => setActiveTab("create")}
//               className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
//                 activeTab === "create"
//                   ? "bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)]"
//                   : "border border-[color:var(--accent-border)] opacity-70 hover:opacity-100"
//               }`}
//             >
//               Create Squad
//             </button>
//             <button
//               onClick={() => setActiveTab("join")}
//               className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
//                 activeTab === "join"
//                   ? "bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)]"
//                   : "border border-[color:var(--accent-border)] opacity-70 hover:opacity-100"
//               }`}
//             >
//               Join Squad
//             </button>
//           </div>

//           <div className="relative min-h-[400px] overflow-hidden rounded-2xl border border-[color:var(--accent-border)] p-4 bg-[color:var(--accent-bg)]/40 backdrop-blur-sm">
//             <AnimatePresence mode="wait">
//               {activeTab === "create" ? (
//                 <motion.div
//                   key="create"
//                   initial={{ opacity: 0, x: 40 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -40 }}
//                   transition={{ duration: 0.25 }}
//                 >
//                   <NewSquadPage />
//                 </motion.div>
//               ) : (
//                 <motion.div
//                   key="join"
//                   initial={{ opacity: 0, x: 40 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -40 }}
//                   transition={{ duration: 0.25 }}
//                 >
//                   <JoinSquadPage />
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }
