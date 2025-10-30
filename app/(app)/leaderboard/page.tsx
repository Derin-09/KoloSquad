"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface Squad {
  id: string;
  name: string;
  target: number
  saved: number;
}

export default function LeaderboardPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("squads")
          .select("id, name, target_amount, contributions:contributions(amount,status)")
          .limit(50);
        const rows = (data || []).map((s) => ({
          id: s.id,
          name: s.name,
          target: Number(s.target_amount || 0),
          saved: (s.contributions || []).filter((c) => c.status === "success").reduce((a: number, c) => a + Number(c.amount || 0), 0),
        }));
        rows.sort((a, b) => b.saved - a.saved);
        setSquads(rows);
      } catch {
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <main className="max-w-3xl mx-aut p-4 space-y-6">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      {loading && <div>Loading...</div>}
      <div className="rounded-md border" style={{ borderColor: "var(--border)" }}>
        <div className="grid grid-cols-3 text-xs uppercase opacity-60 p-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div>Squad</div>
          <div className="text-right">Saved</div>
          <div className="text-right">Target</div>
        </div>
        {squads.map((s, i) => (
          <div key={s.id} className="grid grid-cols-3 p-3 border-b last:border-none" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2"><span className="badge-soft">#{i+1}</span> <span className="font-medium">{s.name}</span></div>
            <div className="text-right">₦{s.saved.toLocaleString()}</div>
            <div className="text-right">₦{s.target.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
