"use client";

import React, { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import NewContributionPlan from "../../contributions/[id]/new/page";
import { ContributionType, MemberType, Squad, SquadIdType } from "@/types/types";



export default function SquadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: squadId } = use(params);

  const [squad, setSquad] = useState<SquadIdType | null>(null);
  const [contributions, setContributions] = useState<ContributionType[]>([]);
  const [members, setMembers] = useState<MemberType[]>([]);
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
      // else setMembers(membersData || []);
      else
        setMembers(
          (membersData || []).map((m) => ({
            user_id: m.user_id,
            role: m.role,
            profiles: m.profiles?.[0] || undefined, // take first element or undefined
          }))
        );

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
        <NewContributionPlan params={{id: squadId}} />
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
                  className={`px-3 py-1 rounded-full text-xs font-medium ${c.status === "successful"
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
