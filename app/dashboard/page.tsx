"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ProgressBar } from "@/components/ProgressBar";

interface Squad {
  id: string;
  name: string;
  target_amount: number;
  balance: number;
  invite_code: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setError(null);
      setLoading(true);
      try {
        const {
          data: { user },
          error: uerr,
        } = await supabase.auth.getUser();
        if (uerr) throw uerr;
        if (!user) {
          window.location.href = "/sign-in";
          return;
        }

        const { data, error } = await supabase
          .from("squads")
          .select("id, name, target_amount, invite_code, contributions:contributions(amount)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        const withBalance = (data || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          target_amount: Number(s.target_amount || 0),
          invite_code: s.invite_code,
          balance: (s.contributions || []).reduce((acc: number, c: any) => acc + Number(c.amount || 0), 0),
        }));
        if (mounted) setSquads(withBalance);
      } catch (e: any) {
        setError(e.message || "Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Squads</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Create or join squads to start saving.</p>
        </div>
        <Link href="/squads/new" className="rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2">
          New Squad
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      <div className="grid md:grid-cols-2 gap-4">
        {squads.map((s) => (
          <div key={s.id} className="rounded-lg border border-black/10 dark:border-white/15 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{s.name}</h3>
              <span className="text-xs opacity-70">Invite: {s.invite_code}</span>
            </div>
            <ProgressBar value={s.balance} max={s.target_amount || 1} />
            <div className="text-sm flex justify-between">
              <span>Saved</span>
              <span>
                ₦{s.balance.toLocaleString()} / ₦{(s.target_amount || 0).toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        {!loading && squads.length === 0 && (
          <div className="text-sm opacity-80">No squads yet. Create your first squad.</div>
        )}
      </div>
    </main>
  );
}
