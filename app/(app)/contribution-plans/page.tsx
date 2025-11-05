"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Squad } from "@/types/types";



export default function ContributionPlansPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSquads = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get squads where user is a member
      const { data, error } = await supabase
        .from("squads")
        .select("id, name, target_amount, created_at, invite_code")
        .order("created_at", { ascending: false });

      if (!error) setSquads(data || []);
      setLoading(false);
    };

    fetchSquads();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading squads...</p>;

  if (squads.length === 0)
    return <p className="text-center mt-10">No squads yet. Create one first.</p>;

  return (
    <main className="max-w-5xl mx-auo space-y-6">
      <h1 className="text-2xl font-bold">Your Squads</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {squads.map((squad) => (
          <div
            key={squad.id}
            className="rounded-lg bg-accent text-[#1d1333] p-4"
          >
            <h2 className="text-lg font-semibold">{squad.name}</h2>
            <p className="text-sm text-muted-foreground">
              Target: ₦{squad.target_amount?.toLocaleString()}
            </p>

            <Link
            //   href={`/contributions/${squad.id}/new`}
              href={`/contributions`}
              className="inline-block mt-3 rounded-md text-[#1d1333] bg-[#F8F9FD] shadow-md hover:scale-105 active:shadow-none active:mt-2 px-3 py-1.5 text-sm hover:brightness-95"
            >
              View Contribution Plan
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
