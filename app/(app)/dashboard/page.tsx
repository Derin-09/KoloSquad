"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { SimpleBars } from "@/components/charts/SimpleBars";
import { Donut } from "@/components/charts/Donut";

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
          .select("id, name, target_amount, invite_code, contributions:contributions(amount,status)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        const withBalance = (data || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          target_amount: Number(s.target_amount || 0),
          invite_code: s.invite_code,
          balance: (s.contributions || []).reduce((acc: number, c: any) => acc + Number(c.amount || 0), 0),
          contributions: s.contributions || [],
        }));
        if (mounted) setSquads(withBalance);
      } catch (e: any) {
        const msg = e?.message || "Failed to load dashboard";
        // Gracefully handle missing table / schema cache errors in new environments
        if (/schema cache|could not find the table|relation .* does not exist/i.test(msg)) {
          setError(null);
          setSquads([]);
        } else {
          setError(msg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const totalSaved = squads.reduce((acc, s: any) => acc + (s.balance || 0), 0);
    const totalTarget = squads.reduce((acc, s) => acc + (s.target_amount || 0), 0);
    const totalContribs = squads.reduce((acc, s: any) => acc + (s.contributions?.length || 0), 0);
    return { totalSaved, totalTarget, totalContribs };
  }, [squads]);

  const weekLabels = ["Mar 1 - 7", "Mar 8 - 14", "Mar 15 - 21", "Mar 22 - 28", "Final wk"];
  const weekData = [25000, 120000, 90000, 140000, 190000];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm">Hey, Saver! 👋</div>
          <h1 className="text-xl sm:text-2xl font-semibold">You saved ₦{totals.totalSaved.toLocaleString()} this month.</h1>
        </div>
        <Link href="/squads/new" className="rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2">
          New Squad
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm opacity-70">Last 30 days</div>
          <span className="badge-soft">Overview</span>
        </div>
        <SimpleBars data={weekData} labels={weekLabels} height={180} />
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm font-medium mb-2">Success rate</div>
          <Donut value={totals.totalContribs} total={Math.max(totals.totalContribs, 150)} label="Successful contributions" />
        </Card>

        <Card>
          <div className="text-sm font-medium mb-3">Your Squads</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {squads.map((s) => (
              <div key={s.id} className="card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{s.name}</div>
                  <span className="text-xs opacity-70">Invite: {s.invite_code}</span>
                </div>
                <div className="text-sm flex justify-between">
                  <span>Saved</span>
                  <span>₦{s.balance.toLocaleString()} / ₦{(s.target_amount || 0).toLocaleString()}</span>
                </div>
                <div className="h-2 rounded bg-black/10 dark:bg-white/10">
                  <div
                    className="h-2 rounded bg-[color:var(--accent)]"
                    style={{ width: `${Math.min(100, ((s.balance || 0) / Math.max(1, s.target_amount)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {!loading && squads.length === 0 && (
              <div className="text-sm opacity-80">No squads yet. Create your first squad.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
