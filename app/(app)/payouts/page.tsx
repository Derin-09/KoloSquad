"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Spinner from "@/app/loading";

interface Squad {
  id: string;
  name: string;
  target_amount: number;
  balance: number;
  contributions: {amount: number; status: number}[]
}

export default function PayoutsPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("squads")
          .select("id, name, target_amount, contributions:contributions(amount,status)");
        if (error) throw error;
        const mapped = (data || []).map((s) => ({
          ...s,
          balance: (s.contributions || []).filter((c) => c.status === "success").reduce((a: number, c) => a + Number(c.amount || 0), 0),
        }));
        setSquads(mapped);
      } catch (e) {
        const err = e instanceof Error ? e.message :  "Failed to load payouts";
        setErr(err);
      } finally { setLoading(false); }
    })();
  }, []);

  async function simulatePayout(squadId: string) {
    try {
      await supabase.from("payouts").insert({ squad_id: squadId, simulated: true, created_at: new Date().toISOString() });
      alert("Payout simulated (recorded)");
    } catch {
      alert("Payout simulated (no DB table present)");
    }
  }

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Payouts</h1>
          <p className="text-sm opacity-70">Track requested and received payouts.</p>
        </div>
      </header>

      {loading && <Spinner/>}
      {err && <div className="text-sm text-red-600">{err}</div>}

      <section className="card p-4 space-y-3">
        <div className="text-sm font-medium">Squad status</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {squads.map((s) => {
            const locked = s.balance < Number(s.target_amount || 0);
            return (
              <div key={s.id} className="rounded-md border p-3" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between">
                  <div className="font-medium">{s.name}</div>
                  <span className="badge-soft">{locked ? "Locked" : "Unlocked"}</span>
                </div>
                <div className="text-xs opacity-80 mt-1">₦{s.balance.toLocaleString()} / ₦{Number(s.target_amount || 0).toLocaleString()}</div>
                <button disabled={locked} onClick={() => simulatePayout(s.id)} className="mt-2 rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-3 py-2 text-xs disabled:opacity-50">{locked ? "Target not reached" : "Simulate payout"}</button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
