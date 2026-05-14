"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ContributionType, SquadIdType } from "@/types/types";
import NewContributionPlan from "../../contributions/[id]/new/NewContributionClient";
import Spinner from "@/app/loading";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";


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



type RawMember = {
  user_id: string;
  role: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  contributions: {
    amount: number;
    status: string;
  }[] | null;
};

type RawMembersType = RawMember[];


export default function SquadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: squadId } = use(params);
  const [squad, setSquad] = useState<SquadIdType | null>(null);
  const [members, setMembers] = useState<MemberType[]>([]);
  const [contributions, setContributions] = useState<ContributionType[]>([]);
  const [totalSaved, setTotalSaved] = useState<number>(0);
    const [dialogShow, setDialogShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      // Fetch squad info
      const { data: squadData, error: squadError } = await supabase
        .from("squads")
        .select("id, name, target_amount, invite_code, created_by")
        .eq("id", squadId)
        .maybeSingle();

      if (squadError) console.error("Squad fetch error:", squadError);
      else setSquad(squadData);


      // const { data: rawMembers, error: memberError } = await supabase
      //   .from("squad_members")
      //   .select(`
      //     user_id,
      //     role,
      //     profiles (full_name, avatar_url),
      //     contributions (amount, status)
      //   `)
      //   .eq("squad_id", squadId);

      const { data: memberData, error: memberError } = await supabase
  .from("squad_member_contributions")
  // .from("contributions")
  .select("*")
  .eq("squad_id", squadId);

      // const typedRawMembers = (rawMembers ?? []) as RawMembersType;
      // const typedRawMembers = (rawMembers ?? []) as unknown as RawMembersType;



      // if (memberError) {
      //   console.error("Member fetch error:", memberError);
      // } else {
      //   const mapped: MemberType[] = typedRawMembers.map((m) => {
      //     const successful = (m.contributions || []).filter(
      //       (c: { status: string }) => c.status === "successful"
      //     );
      //     const total = successful.reduce(
      //       (sum: number, c: { amount: number }) => sum + c.amount,
      //       0
      //     );
      //     return {
      //       user_id: m.user_id,
      //       role: m.role,
      //       profiles: {
      //         full_name: m.profiles?.full_name ?? null,
      //         avatar_url: m.profiles?.avatar_url ?? null,
      //       },
      //       total_contributed: total,
      //     };
      //   });

      //   // Place owner at the top
      //   const sorted = mapped.sort((a, b) =>
      //     a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0
      //   );
      //   setMembers(sorted);
      // }

      if (memberError) {
  console.error("Member fetch error:", memberError);
} else {
  const mapped: MemberType[] = (memberData || []).map((m) => ({
    user_id: m.user_id,
    role: m.role,
    profiles: {
      full_name: m.full_name,
      avatar_url: m.avatar_url,
    },
    total_contributed: m.total_contributed,
  }));

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

  useEffect(()=> {
    setDialogShow(true)
  }, [squad])

  if (!squad) return <Spinner />;


  const deleteSquad = async () => {
    if (!confirm("Are you sure you want to delete this squad? This cannot be undone.")) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      if (user.id !== squad?.created_by) throw new Error("Only the owner can delete this squad");

      const { error } = await supabase.from("squads").delete().eq("id", squadId);
      if (error) throw error;

      alert("Squad deleted successfully");
      router.refresh(); 
      router.push("/squads");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete squad");
    }
  };

  
    console.log('aaa', members)

   

  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 space-y-12 animate-fadeIn">

    {
       dialogShow && (
    <Dialog open={dialogShow} onOpenChange={setDialogShow}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{squad.name}</DialogTitle>
              <DialogDescription>
                Invite others with this code!
              </DialogDescription>
            </DialogHeader>
              <p>{squad.invite_code}</p>
          </DialogContent>
        </Dialog>
        )
    }
      {/* Fixed Back Button */}
      <Link
        href="/squads"
        className="absolute top-6 left-6 z-20 bg-[color:var(--card)]/80 backdrop-blur-md border border-white/10 text-[color:var(--accent-button)] font-semibold px-4 py-2 rounded-lg  transition-all text-sm"
      >
        ← Back
      </Link>

      {/* Header */}
      <header className="bg-gradient-to-br from-[color:var(--card)]/90 to-[color:var(--accent-muted)]/40 border border-white/10 rounded-3xl p-8 shadow-md shadow-[0_0_25px_-10px_var(--accent-button)] flex flex-col md:flex-row justify-between gap-6 transition-transform hover:scale-[1.01]">
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
          <code className="font-mono text-lg font-semibold bg-[color:var(--accent-muted)]/40 px-4 py-2 rounded-lg block ">
            {squad.invite_code || "N/A"}
          </code>
        </div>
      </header>

      {/* Members Table */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 tracking-tight">Squad Members</h2>

        <div className="overflow-x-auto rounded-2xl border border-white/10  bg-[color:var(--card)]/70 backdrop-blur-lg">
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
                    className={`transition-colors hover:bg-[color:var(--accent-muted)]/20 ${isOwner ? "bg-[color:var(--accent-muted)]/30 font-semibold" : ""
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
                  className={`px-3 py-1 rounded-full text-xs font-medium ${c.status === "successful"
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

      {squad?.created_by && (
        <div className="pt-10 border-t border-white/10 flex justify-end">
          <button
            onClick={deleteSquad}
            className="px-5 py-2 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors hover:cursor-pointer"
          >
            Delete Squad
          </button>
        </div>
      )}
    </div>
  );
}












