"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { SimpleBars } from "@/components/charts/SimpleBars";
import { Donut } from "@/components/charts/Donut";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
        // Gate by email verification
        if (!user.email_confirmed_at) {
          setError("Please verify your email address to access the dashboard. We can resend the verification email.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("squads")
          .select("id, name, target_amount, invite_code, contributions:contributions(amount,status), members:squad_members(user_id)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        const withBalance = (data || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          target_amount: Number(s.target_amount || 0),
          invite_code: s.invite_code,
          balance: (s.contributions || []).reduce((acc: number, c: any) => acc + Number(c.amount || 0), 0),
          contributions: s.contributions || [],
          members: s.members || [],
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

  // Realtime updates for contributions and squad membership
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contributions" },
        () => {
          // re-fetch lightweight
          (async () => {
            try {
              const { data, error } = await supabase
                .from("squads")
                .select("id, name, target_amount, invite_code, contributions:contributions(amount,status), members:squad_members(user_id)")
                .order("created_at", { ascending: false });
              if (!error) {
                const withBalance = (data || []).map((s: any) => ({
                  id: s.id,
                  name: s.name,
                  target_amount: Number(s.target_amount || 0),
                  invite_code: s.invite_code,
                  balance: (s.contributions || []).reduce((acc: number, c: any) => acc + Number(c.amount || 0), 0),
                  contributions: s.contributions || [],
                  members: s.members || [],
                }));
                setSquads(withBalance);
              }
            } catch {}
          })();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "squad_members" },
        () => {
          (async () => {
            try {
              const { data, error } = await supabase
                .from("squads")
                .select("id, name, target_amount, invite_code, contributions:contributions(amount,status), members:squad_members(user_id)")
                .order("created_at", { ascending: false });
              if (!error) {
                const withBalance = (data || []).map((s: any) => ({
                  id: s.id,
                  name: s.name,
                  target_amount: Number(s.target_amount || 0),
                  invite_code: s.invite_code,
                  balance: (s.contributions || []).reduce((acc: number, c: any) => acc + Number(c.amount || 0), 0),
                  contributions: s.contributions || [],
                  members: s.members || [],
                }));
                setSquads(withBalance);
              }
            } catch {}
          })();
        }
      )
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  const weekLabels = ["Mar 1 - 7", "Mar 8 - 14", "Mar 15 - 21", "Mar 22 - 28", "Final wk"];
  const weekData = [25000, 120000, 90000, 140000, 190000];

  return (
    <ProtectedRoute>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm">Hey, Saver!</div>
          <h1 className="text-xl sm:text-2xl font-semibold">You saved ₦{totals.totalSaved.toLocaleString()} this month.</h1>
        </div>
        <div className="flex px-1 md:px-3 py-2 rounded-md text-[color:var(--accent)]/70 md:bg-black md:text-white md:dark:bg-white md:dark:text-black ">
        <Link href="/squads/new" className="px-3 py-2">
          New Squad
        </Link>
      </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && (
        <div className="card p-3">
          <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
          {error.includes("verify your email") && (
            <button
              onClick={async () => {
                try {
                  const { data: userData } = await supabase.auth.getUser();
                  const em = userData?.user?.email;
                  if (em) await supabase.auth.resend({ type: "signup", email: em });
                } catch {}
              }}
              className="rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2"
            >
              Resend verification email
            </button>
          )}
        </div>
      )}

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
                  <div className="text-xs opacity-70 flex items-center gap-2">
                    <span>Invite: {s.invite_code}</span>
                    <button
                      className="underline"
                      onClick={() => {
                        const url = `${window.location.origin}/squads/join?code=${encodeURIComponent(s.invite_code)}`;
                        navigator.clipboard?.writeText(url);
                      }}
                    >Copy link</button>
                  </div>
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
                <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                  <span>{(s.members || []).length} member{(s.members || []).length === 1 ? "" : "s"}</span>
                  <div className="flex items-center gap-2">
                    <a href={`/flex?name=${encodeURIComponent(s.name)}&saved=${encodeURIComponent(s.balance)}&target=${encodeURIComponent(s.target_amount || 0)}`} className="underline">Flex card</a>
                    <a href={`/contribute?squadId=${s.id}`} className="rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-2 py-1">Contribute</a>
                  </div>
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
    </ProtectedRoute>
  );
}
