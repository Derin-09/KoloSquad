"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function ContributionPlansPage() {
  const [squads, setSquads] = useState<any[]>([]);
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
    <main className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Your Squads</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {squads.map((squad) => (
          <div
            key={squad.id}
            className="rounded-lg border border-[color:var(--accent-input)] p-4"
          >
            <h2 className="text-lg font-semibold">{squad.name}</h2>
            <p className="text-sm text-muted-foreground">
              Target: ₦{squad.target_amount?.toLocaleString()}
            </p>

            <Link
              href={`/contributions/${squad.id}/new`}
              className="inline-block mt-3 rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-3 py-1.5 text-sm hover:brightness-95"
            >
              Create Contribution Plan
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
