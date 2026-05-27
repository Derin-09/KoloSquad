"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ContributionType, SquadIdType } from "@/types/types";
import NewContributionPlan from "../../contributions/[id]/new/NewContributionClient";
import Spinner from "@/app/loading";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Zap, Clock, AlertCircle, Users } from "lucide-react";


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
    <div className="relative min-h-screen max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 animate-fadeIn">

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
      {/* Back Button */}
      <Link
        href="/squads"
        className="inline-flex items-center gap-2 text-[color:var(--accent-button)] font-semibold px-4 py-2 rounded-lg hover:bg-[color:var(--accent-muted)]/20 transition-all text-sm mb-8"
      >
        ← Back to Squads
      </Link>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[color:var(--card)]/90 to-[color:var(--accent-muted)]/40 border border-white/10 rounded-3xl p-8 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-[color:var(--accent-button)]/20 text-[color:var(--accent-button)] px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              High Performance
            </span>
            <span className="bg-blue-500/20 text-blue-300 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              Public Squad
            </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{squad.name}</h1>
            <p className="text-muted-foreground text-base">The elite circle for engineering leads and tech enthusiasts building long-term wealth through disciplined weekly savings.</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-widest">Total Assets</p>
              <p className="text-2xl font-bold text-foreground mt-1">₦{totalSaved.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-widest">Squad Rank</p>
              <p className="text-2xl font-bold text-[color:var(--accent-button)] mt-1">#4 Globally</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-widest">Invite Code</p>
              <code className="font-mono text-lg font-bold mt-1 block">{squad.invite_code || "N/A"}</code>
            </div>
          </div>
        </div>

        {/* Goal Progress & Leaderboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goal Progress */}
          <div className="bg-[color:var(--card)]/70 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <h3 className="text-sm uppercase text-muted-foreground font-semibold tracking-widest mb-6">Annual Goal Progress</h3>
            
            {/* Donut Chart */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-[color:var(--accent-muted)]/30"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={`${75 * 3.14} ${100 * 3.14}`}
                    className="text-[color:var(--accent-button)] transition-all"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">75%</span>
                  <span className="text-xs text-muted-foreground">Complete</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-xs text-muted-foreground">Goal: <span className="text-[color:var(--accent-button)] font-semibold">₦320,000</span></p>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2 bg-[color:var(--card)]/70 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm uppercase text-muted-foreground font-semibold tracking-widest">Leaderboard</h3>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              {members.slice(0, 3).map((m, i) => {
                const name = m.profiles.full_name || "Unnamed User";
                const avatar = m.profiles.avatar_url;
                const badges = ["100%", "98%", "95%"];
                
                return (
                  <div key={i} className="flex items-center justify-between pb-4 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[color:var(--accent-muted)] flex items-center justify-center text-xs font-bold text-white">{i + 1}</span>
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={name}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[color:var(--accent-muted)]/50 flex items-center justify-center font-semibold text-white">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">Consistency: {badges[i]}</p>
                      </div>
                    </div>
                    <p className="font-bold text-[color:var(--accent-button)]">₦{m.total_contributed.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Squad Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[color:var(--card)]/70 border border-white/10 rounded-3xl p-8 backdrop-blur-md space-y-6">
            <h3 className="text-lg font-bold">Squad Rules</h3>

            {/* Weekly Contribution */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-[color:var(--accent-button)]/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[color:var(--accent-button)]" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm">Weekly Contribution</p>
                <p className="text-xs text-muted-foreground mt-1">₦500 minimum<br/>Due every Sunday by 11:59 PM</p>
              </div>
            </div>

            {/* Grace Period */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm">Grace Period</p>
                <p className="text-xs text-muted-foreground mt-1">2 Passes per Year<br/>Notification required 48hrs prior</p>
              </div>
            </div>

            {/* Penalty */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm">Penalty Clause</p>
                <p className="text-xs text-muted-foreground mt-1">5% Late Fee<br/>Redistributed to active members</p>
              </div>
            </div>
          </div>

          {/* Membership */}
          <div className="bg-[color:var(--card)]/70 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <div className="flex gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm">Membership</p>
                <p className="text-xs text-muted-foreground mt-1">{members.length}/15 Members<br/>3 Spots available currently</p>
              </div>
            </div>

            {/* Member Activity */}
            <div className="pt-6 border-t border-white/10">
              <h4 className="text-sm font-semibold mb-4">Member Activity</h4>
              <div className="flex items-center justify-center gap-2">
                {members.slice(0, 6).map((m, i) => (
                  m.profiles.avatar_url ? (
                    <img
                      key={i}
                      src={m.profiles.avatar_url}
                      alt={m.profiles.full_name || "Member"}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div key={i} className="w-10 h-10 rounded-full bg-[color:var(--accent-muted)]/50 flex items-center justify-center text-xs font-semibold text-white">
                      {(m.profiles.full_name || "U").charAt(0).toUpperCase()}
                    </div>
                  )
                ))}
                {members.length > 6 && (
                  <div className="w-10 h-10 rounded-full bg-[color:var(--accent-muted)] flex items-center justify-center text-xs font-bold text-white">
                    +{members.length - 6}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* New Plan Section */}
        {/* <div className="bg-[color:var(--card)]/70 p-8 rounded-3xl border border-white/10 shadow-[0_0_25px_-10px_var(--accent-button)] backdrop-blur-md">
          <NewContributionPlan squadId={squadId} />
        </div> */}

        {/* Contribution History */}
        {/* <div>
          <h2 className="text-2xl font-bold mb-6">Contribution History</h2>
          {contributions.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">No contributions yet.</p>
          ) : (
            <div className="grid gap-3">
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
        </div> */}

        {/* Delete Squad Button */}
        {squad?.created_by && (
          <div className="pt-6 border-t border-white/10 flex justify-end">
            <button
              onClick={deleteSquad}
              className="px-6 py-2 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              Delete Squad
            </button>
          </div>
        )}
      </div>
    </div>
  );
}












