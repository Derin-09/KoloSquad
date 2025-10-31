"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ContributionType, SquadIdType } from "@/types/types";
import NewContributionPlan from "../../contributions/[id]/new/NewContributionClient";
import Spinner from "@/app/loading";

interface ProfileType {
  full_name: string | null;
  avatar_url: string | null;
}

interface MemberType {
  user_id: string;
  role: string;
  profiles: ProfileType;
  total_contributed: number;
}

export default function SquadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: squadId } = use(params);

  const [squad, setSquad] = useState<SquadIdType | null>(null);
  const [members, setMembers] = useState<MemberType[]>([]);
  const [contributions, setContributions] = useState<ContributionType[]>([]);
  const [totalSaved, setTotalSaved] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      // Fetch squad info
      const { data: squadData, error: squadError } = await supabase
        .from("squads")
        .select("id, name, target_amount, invite_code, created_by")
        .eq("id", squadId)
        .single();

      if (squadError) console.error("Squad fetch error:", squadError);
      else setSquad(squadData);

      // Fetch members with total contributed
      const { data: rawMembers, error: memberError } = await supabase
        .from("squad_members")
        .select(`
          user_id,
          role,
          profiles (
            full_name,
            avatar_url
          ),
          contributions!left (
            amount,
            status
          )
        `)
        .eq("squad_id", squadId);

      if (memberError) {
        console.error("Member fetch error:", memberError);
      } else {
        const mapped: MemberType[] = (rawMembers || []).map((m: any) => {
          const successful = (m.contributions || []).filter(
            (c: { status: string }) => c.status === "successful"
          );
          const total = successful.reduce(
            (sum: number, c: { amount: number }) => sum + c.amount,
            0
          );
          return {
            user_id: m.user_id,
            role: m.role,
            profiles: {
              full_name: m.profiles?.full_name ?? null,
              avatar_url: m.profiles?.avatar_url ?? null,
            },
            total_contributed: total,
          };
        });

        // Place owner at the top
        const sorted = mapped.sort((a, b) =>
          a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0
        );
        setMembers(sorted);
      }

      // Fetch contributions
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

  if (!squad) return <Spinner />;

  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 space-y-12 animate-fadeIn">
      {/* Fixed Back Button */}
      <Link
        href="/squads"
        className="absolute top-6 left-6 z-20 bg-[color:var(--card)]/80 backdrop-blur-md border border-white/10 text-[color:var(--accent-button)] font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-[0_0_25px_-5px_var(--accent-button)] transition-all text-sm"
      >
        ← Back
      </Link>

      {/* Header */}
      <header className="bg-gradient-to-br from-[color:var(--card)]/90 to-[color:var(--accent-muted)]/40 border border-white/10 rounded-3xl p-8 shadow-md flex flex-col md:flex-row justify-between gap-6 transition-transform hover:scale-[1.01]">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold capitalize tracking-tight">{squad.name}</h1>
          <p className="text-muted-foreground text-sm">
            Target:{" "}
            <span className="font-semibold text-foreground">
              ₦{(squad.target_amount ?? 0).toLocaleString()}
            </span>{" "}
            &nbsp;|&nbsp; Saved:{" "}
            <span className="font-semibold text-[color:var(--accent-button)]">
              ₦{totalSaved.toLocaleString()}
            </span>
          </p>
        </div>

        <div className="text-right space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Invite Code
          </h3>
          <code className="font-mono text-lg font-semibold bg-[color:var(--accent-muted)]/40 px-4 py-2 rounded-lg block shadow-inner">
            {squad.invite_code || "N/A"}
          </code>
        </div>
      </header>

      {/* Members Table */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 tracking-tight">Squad Members</h2>

        <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-[0_0_25px_-10px_var(--accent-button)] bg-[color:var(--card)]/70 backdrop-blur-lg">
          <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="bg-[color:var(--accent-muted)]/30 text-xs uppercase text-muted-foreground tracking-wide">
              <tr>
                <th className="px-6 py-3">Member</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Total Contributed</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => {
                const name = m.profiles.full_name || "Unnamed User";
                const avatar = m.profiles.avatar_url;
                const isOwner = m.role === "owner";

                return (
                  <tr
                    key={i}
                    className={`transition-colors hover:bg-[color:var(--accent-muted)]/20 ${
                      isOwner ? "bg-[color:var(--accent-muted)]/30 font-semibold" : ""
                    }`}
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={name}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[color:var(--accent-muted)] flex items-center justify-center font-semibold text-white">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{name}</span>
                    </td>
                    <td className="px-6 py-4 capitalize">{m.role}</td>
                    <td className="px-6 py-4 font-medium text-[color:var(--accent-button)]">
                      ₦{m.total_contributed.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* New Plan */}
      <section className="pt-4">
        <div className="bg-[color:var(--card)]/70 p-8 rounded-3xl border border-white/10 shadow-[0_0_25px_-10px_var(--accent-button)] backdrop-blur-md">
          <NewContributionPlan squadId={squadId} />
        </div>
      </section>

      {/* Contributions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Contribution History</h2>
        {contributions.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">No contributions yet.</p>
        ) : (
          <div className="space-y-3">
            {contributions.map((c, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-[color:var(--card)]/60 border border-white/10 rounded-xl px-6 py-4 shadow-[0_0_20px_-10px_var(--accent-button)] hover:shadow-[0_0_25px_-8px_var(--accent-button)] transition-all"
              >
                <div>
                  <p className="font-semibold text-sm">
                    ₦{c.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    c.status === "successful"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-yellow-500/20 text-yellow-300"
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
// import Link from "next/link";
// import { supabase } from "@/lib/supabase/client";
// import { ContributionType, MemberType, SquadIdType } from "@/types/types";
// import NewContributionPlan from "../../contributions/[id]/new/NewContributionClient";
// import Spinner from "@/app/loading";

// interface ProfileType {
//   full_name: string | null;
//   avatar_url: string | null;
// }

// interface MemberQueryType {
//   user_id: string;
//   role: string;
//   profiles: ProfileType | null;
// }

// export default function SquadPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id: squadId } = use(params);

//   const [squad, setSquad] = useState<SquadIdType | null>(null);
//   const [members, setMembers] = useState<MemberType[]>([]);
//   const [contributions, setContributions] = useState<ContributionType[]>([]);
//   const [totalSaved, setTotalSaved] = useState<number>(0);

//   useEffect(() => {
//     async function fetchData() {
//       // Fetch squad info
//       const { data: squadData, error: squadError } = await supabase
//         .from("squads")
//         .select("id, name, target_amount, invite_code, created_by")
//         .eq("id", squadId)
//         .single();

//       if (squadError) console.error("Squad fetch error:", squadError);
//       else setSquad(squadData);

//       // Fetch members with profiles
//       const { data: rawMembers, error: memberError } = await supabase
//         .from("squad_members")
//         .select(`
//           user_id,
//           role,
//           profiles (
//             full_name,
//             avatar_url
//           )
//         `)
//         .eq("squad_id", squadId);

//       if (memberError) console.error("Member fetch error:", memberError);
//       else {
//         const mapped = (rawMembers || []).map((m: MemberQueryType) => ({
//           user_id: m.user_id,
//           role: m.role,
//           profiles: m.profiles ?? { full_name: null, avatar_url: null },
//         }));
//         setMembers(mapped);
//       }

//       // Fetch contributions
//       const { data: contribData } = await supabase
//         .from("contributions")
//         .select("amount, status, created_at")
//         .eq("squad_id", squadId)
//         .order("created_at", { ascending: false });

//       const total =
//         contribData
//           ?.filter((c) => c.status === "successful")
//           .reduce((sum, c) => sum + c.amount, 0) || 0;

//       setContributions(contribData || []);
//       setTotalSaved(total);
//     }

//     fetchData();
//   }, [squadId]);

//   if (!squad) return <Spinner />;

//   return (
//     <div className="max-w-5xl mx-auto px-6 py-12 space-y-12 animate-fadeIn">
//       {/* Back Link */}
//       <Link
//         href="/squads"
//         className="text-sm font-semibold text-[color:var(--accent-button)] hover:underline"
//       >
//         ← Back
//       </Link>

//       {/* Header */}
//       <header className="bg-gradient-to-br from-[color:var(--card)] to-[color:var(--accent-muted)] border border-white/10 rounded-3xl p-8 shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] flex justify-between items-start transition-transform hover:scale-[1.01]">
//         <div className="space-y-3">
//           <h1 className="text-4xl font-bold capitalize tracking-tight">{squad.name}</h1>
//           <p className="text-muted-foreground text-sm">
//             Target:{" "}
//             <span className="font-semibold text-foreground">
//               ₦{(squad.target_amount ?? 0).toLocaleString()}
//             </span>{" "}
//             &nbsp;|&nbsp; Saved:{" "}
//             <span className="font-semibold text-[color:var(--accent-button)]">
//               ₦{totalSaved.toLocaleString()}
//             </span>
//           </p>
//         </div>

//         <div className="text-right space-y-2">
//           <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
//             Invite Code
//           </h3>
//           <code className="font-mono text-xl font-semibold bg-[color:var(--accent-muted)]/40 px-5 py-2 rounded-lg block shadow-inn]er">
//             {squad.invite_code || "N/A"}
//           </code>
//         </div>
//       </header>

//       {/* Members Section */}
//       <section>
//         <h2 className="text-2xl font-semibold mb-6 tracking-tight">Squad Members</h2>
//         {members.length === 0 ? (
//           <p className="text-muted-foreground text-sm italic">No members yet.</p>
//         ) : (
//           <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {members.map((m, i) => {
//               const name = m.profiles?.full_name?.split(" ")[0] || "User";
//               const avatar = m.profiles?.avatar_url;
//               const initials = name.charAt(0).toUpperCase();

//               return (
//                 <div
//                   key={i}
//                   className="group flex items-center gap-4 bg-[color:var(--card)]/60 backdrop-blur-lg border border-white/10 rounded-2xl p-4 hover:shadow-[0_0_20px_-5px_var(--accent-button)] transition-all hover:translate-y-[-2px]"
//                 >
//                   {avatar ? (
//                     <img
//                       src={avatar}
//                       alt={name}
//                       className="w-12 h-12 rounded-full object-cover border border-[color:var(--accent-muted)] group-hover:scale-105 transition-transform"
//                     />
//                   ) : (
//                     <div className="w-12 h-12 rounded-full bg-[color:var(--accent-muted)] flex items-center justify-center font-semibold text-lg text-white group-hover:scale-105 transition-transform">
//                       {initials}
//                     </div>
//                   )}

//                   <div>
//                     <p className="font-medium">{name}</p>
//                     <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </section>

//       {/* New Plan */}
//       <section className="pt-4">
//         <div className="bg-[color:var(--card)]/70 p-8 rounded-3xl border border-white/10 shadow-lg backdrop-blur-md">
//           <h2 className="text-lg font-semibold mb-4 tracking-tight">
//             {/* Create a Contribution Plan */}
//           </h2>
//           <NewContributionPlan squadId={squadId} />
//         </div>
//       </section>

//       {/* Contributions */}
//       <section>
//         <h2 className="text-2xl font-semibold mb-4">Contribution History</h2>
//         {contributions.length === 0 ? (
//           <p className="text-muted-foreground text-sm italic">No contributions yet.</p>
//         ) : (
//           <div className="space-y-3">
//             {contributions.map((c, i) => (
//               <div
//                 key={i}
//                 className="flex justify-between items-center bg-[color:var(--card)]/60 border border-white/10 rounded-xl px-6 py-4 shadow-sm hover:shadow-[0_0_25px_-10px_var(--accent-button)] transition-all"
//               >
//                 <div>
//                   <p className="font-semibold text-sm">
//                     ₦{c.amount.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     {new Date(c.created_at).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <span
//                   className={`px-3 py-1 rounded-full text-xs font-medium ${
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

// import React, { useEffect, useState, use } from "react";
// import { supabase } from "@/lib/supabase/client";
// import Link from "next/link";
// import { ContributionType, MemberType, SquadIdType } from "@/types/types";
// import NewContributionPlan from "../../contributions/[id]/new/NewContributionClient";
// import Spinner from "@/app/loading";

// export default function SquadPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id: squadId } = use(params);

//   const [squad, setSquad] = useState<SquadIdType | null>(null);
//   const [contributions, setContributions] = useState<ContributionType[]>([]);
//   const [members, setMembers] = useState<MemberType[]>([]);
//   const [totalSaved, setTotalSaved] = useState<number>(0);

//   useEffect(() => {
//     async function fetchData() {
//       // Squad Info
//       const { data: squadData, error: squadError } = await supabase
//         .from("squads")
//         .select("id, name, target_amount, invite_code, created_by")
//         .eq("id", squadId)
//         .single();

//       if (squadError) console.error("Squad fetch error:", squadError);
//       setSquad(squadData);

//       // Members (joined with profiles)
//       const { data: membersData, error: memberError } = await supabase
//         .from("squad_members")
//         .select(`
//           user_id,
//           role,
//           profiles (
//             full_name,
//             avatar_url
//           )
//         `)
//         .eq("squad_id", squadId);

//       if (memberError) console.error("Member fetch error:", memberError);
//       else setMembers(membersData || []);

//       // Contributions
//       const { data: contribData } = await supabase
//         .from("contributions")
//         .select("amount, status, created_at")
//         .eq("squad_id", squadId)
//         .order("created_at", { ascending: false });

//       const total =
//         contribData
//           ?.filter((c) => c.status === "successful")
//           .reduce((sum, c) => sum + c.amount, 0) || 0;

//       setContributions(contribData || []);
//       setTotalSaved(total);
//     }

//     fetchData();
//   }, [squadId]);

//   if (!squad) return <Spinner />;

//   return (
//     <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
//       {/* Back Link */}
//       <Link
//         href="/squads"
//         className="text-sm font-semibold text-[color:var(--accent-button)] hover:underline"
//       >
//         ← Back
//       </Link>

//       {/* Squad Header */}
//       <header className="bg-[color:var(--card)] shadow-sm rounded-2xl p-6 flex justify-between items-start">
//         <div className="space-y-2">
//           <h1 className="text-3xl font-bold capitalize">{squad.name}</h1>
//           <p className="text-muted-foreground">
//             Target:{" "}
//             <span className="font-medium text-foreground">
//               ₦{(squad.target_amount ?? 0).toLocaleString()}
//             </span>{" "}
//             &nbsp;|&nbsp; Saved:{" "}
//             <span className="font-medium text-[color:var(--accent-button)]">
//               ₦{totalSaved.toLocaleString()}
//             </span>
//           </p>
//         </div>

//         <div className="text-right">
//           <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
//             Invite Code
//           </h3>
//           <code className="font-mono text-xl font-semibold bg-[color:var(--accent-muted)] px-4 py-2 rounded-lg block mt-1">
//             {squad.invite_code || "N/A"}
//           </code>
//         </div>
//       </header>

//       {/* Squad Members */}
//       <section>
//         <h2 className="text-xl font-semibold mb-4">Squad Members</h2>
//         {members.length === 0 ? (
//           <p className="text-muted-foreground">No members yet.</p>
//         ) : (
//           <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
//             {members.map((m, i) => {
//               const name = m.profiles?.full_name?.split(" ")[0] || "User";
//               const avatar = m.profiles?.avatar_url;
//               const initials = name.charAt(0).toUpperCase();

//               return (
//                 <div
//                   key={i}
//                   className="flex items-center gap-3 bg-[color:var(--card)] rounded-xl p-4 shadow-sm hover:shadow-md transition border border-white/10"
//                 >
//                   {avatar ? (
//                     <img
//                       src={avatar}
//                       alt={name}
//                       className="w-12 h-12 rounded-full object-cover border border-[color:var(--accent-muted)]"
//                     />
//                   ) : (
//                     <div className="w-12 h-12 rounded-full bg-[color:var(--accent-muted)] flex items-center justify-center font-semibold text-lg text-white">
//                       {initials}
//                     </div>
//                   )}

//                   <div className="flex flex-col">
//                     <span className="font-medium text-sm">{name}</span>
//                     <span className="text-xs text-muted-foreground capitalize">
//                       {m.role}
//                     </span>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </section>

//       {/* New Plan */}
//       <section className="pt-4">
//         <div className="bg-[color:var(--card)] p-6 rounded-2xl shadow-sm">
//           <h2 className="text-lg font-semibold mb-3">
//             Create a Contribution Plan
//           </h2>
//           <NewContributionPlan squadId={squadId} />
//         </div>
//       </section>

//       {/* Contribution History */}
//       <section>
//         <h2 className="text-xl font-semibold mb-3">Contribution History</h2>
//         {contributions.length === 0 ? (
//           <p className="text-muted-foreground">No contributions yet.</p>
//         ) : (
//           <div className="space-y-2">
//             {contributions.map((c, i) => (
//               <div
//                 key={i}
//                 className="rounded-xl bg-[color:var(--card)] px-5 py-3 flex justify-between items-center shadow-sm border border-white/10 hover:shadow-md transition"
//               >
//                 <div>
//                   <p className="font-semibold text-sm">
//                     ₦{c.amount.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     {new Date(c.created_at).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <span
//                   className={`px-3 py-1 rounded-full text-xs font-medium ${
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

// import React, { useEffect, useState, use } from "react";
// import { supabase } from "@/lib/supabase/client";
// import Link from "next/link";
// // import NewContributionPlan from "../../contributions/[id]/new/page";
// import { ContributionType, MemberType, Squad, SquadIdType } from "@/types/types";
// import NewContributionPlan from "../../contributions/[id]/new/NewContributionClient";
// import Spinner from "@/app/loading";



// export default function SquadPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id: squadId } = use(params);

//   const [squad, setSquad] = useState<SquadIdType | null>(null);
//   const [contributions, setContributions] = useState<ContributionType[]>([]);
//   const [members, setMembers] = useState<MemberType[]>([]);
//   const [totalSaved, setTotalSaved] = useState<number>(0);

//   useEffect(() => {
//     async function fetchData() {
//       // Fetch squad info
//       const { data: squadData, error: squadError } = await supabase
//         .from("squads")
//         .select("id, name, target_amount, invite_code, created_by")
//         .eq("id", squadId)
//         .single();

//       if (squadError) console.error("Squad fetch error:", squadError);
//       setSquad(squadData);

//       // Fetch members
//       const { data: membersData, error: memberError } = await supabase
//         .from("squad_members")
//         .select("user_id, role, profiles(full_name, avatar_url)")
//         .eq("squad_id", squadId);

//       if (memberError) console.error("Member fetch error:", memberError);
//       // else setMembers(membersData || []);
//       else
//         setMembers(
//           (membersData || []).map((m) => ({
//             user_id: m.user_id,
//             role: m.role,
//             profiles: m.profiles?.[0] || undefined,
//           }))
//         );
//         // console.log('members are', members[0].role)

//       // Fetch contributions
//       const { data: contribData } = await supabase
//         .from("contributions")
//         .select("amount, status, created_at")
//         .eq("squad_id", squadId)
//         .order("created_at", { ascending: false });

//       const total =
//         contribData
//           ?.filter((c) => c.status === "successful")
//           .reduce((sum, c) => sum + c.amount, 0) || 0;
//       setContributions(contribData || []);
//       setTotalSaved(total);
//     }

//     fetchData();
//   }, [squadId]);

//   if (!squad) {
//     return (
//     // <p className="p-6 text-center text-muted-foreground">Loading squad...</p>
//     <Spinner/>
//   );
//   }


//   return (
//     <div className="max-w-3xl mx-aut px-6 space-y-12">
//       {/*  Squad Header */}
      
//         <Link
//           href="/squads"
//           className="text-sm font-semibold text-[color:var(--accent-button)] hover:underline"
//         >
//           ← Back
//         </Link>
        
//       <header className="flex items-start justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight capitalize">{squad.name}</h1>
//           <p className="text-muted-foreground">
//              Target: ₦{(squad.target_amount ?? 0).toLocaleString()} &nbsp;|&nbsp;  Saved: ₦
//             {totalSaved.toLocaleString()}
//           </p>
//         </div>
//       </header>

//       {/*  Invite Code */}
//       <section className="rounded-2xl bg-[color:var(--accent-muted)] p-5 flex justify-between items-center">
//         <div>
//           <h3 className="font-semibold text-lg">Invite Code</h3>
//           <p className="text-muted-foreground text-sm">Share this with friends to join</p>
//         </div>
//         <code className="font-mono text-lg tracking-widest bg-white/10 px-4 py-2 rounded-md">
//           {squad.invite_code || "N/A"}
//         </code>
//       </section>

//       {/*  Squad Members */}
//       <section>
//         <h2 className="text-xl font-semibold mb-3">Squad Members</h2>
//         {members.length === 0 ? (
//           <p className="text-muted-foreground">No members yet.</p>
//         ) : (
//           <div className="flex flex-wrap gap-3">
//             {members.map((m, i) => (
//               <div
//                 key={i}
//                 className="flex items-center gap-3 bg-[color:var(--card)] px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition"
//               >
//                 <div className="w-10 h-10 rounded-full bg-[color:var(--accent-muted)] flex items-center justify-center text-sm font-medium">
//                   {m.profiles?.full_name?.[0] || "?"}
//                 </div>
//                 <div>
//                   <p className="font-medium text-sm">
//                     {m.profiles?.full_name || "Anonymous"}
//                   </p>
//                   <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       {/*  New Plan */}
//       <section className="pt-2">
//         {/* <h2 className="text-xl font-semibold mb-3">Create a Contribution Plan</h2> */}
//         <NewContributionPlan
//           squadId={squadId} 
//           />
//       </section>

//       {/*  Contribution History */}
//       <section>
//         <h2 className="text-xl font-semibold mb-3">Contribution History</h2>
//         {contributions.length === 0 ? (
//           <p className="text-muted-foreground">No contributions yet.</p>
//         ) : (
//           <div className="space-y-2">
//             {contributions.map((c, i) => (
//               <div
//                 key={i}
//                 className="rounded-xl bg-[color:var(--card)] px-4 py-3 flex justify-between items-center shadow-sm hover:shadow-md transition"
//               >
//                 <div>
//                   <p className="font-semibold text-sm">₦{c.amount.toLocaleString()}</p>
//                   <p className="text-xs text-muted-foreground">
//                     {new Date(c.created_at).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <span
//                   className={`px-3 py-1 rounded-full text-xs font-medium ${c.status === "successful"
//                       ? "bg-green-100 text-green-700"
//                       : "bg-yellow-100 text-yellow-700"
//                     }`}
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
