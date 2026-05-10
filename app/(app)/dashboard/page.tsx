"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

import { Card } from "@/components/ui/Card";
import { SimpleBars } from "@/components/charts/SimpleBars";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";
import Spinner from "@/app/loading";
import UserProfile from "@/components/pages/dashboard/UserProfile";
import Alert from "@/components/pages/dashboard/Alert";
import ContributionOverview from "@/components/pages/dashboard/ContributionOverview";
import SquadList from "@/components/pages/dashboard/SquadList";
import ContributionsSection from "@/components/pages/dashboard/ContributionsSection";
import Badges from "@/components/pages/dashboard/Badges";
import { Button } from "@/components/ui/button";
import { Bolt, Link2, Plus, PlusCircle, Zap } from "lucide-react";
import { SiFlashforge, SiThunderstore } from "react-icons/si";
import WeeklyChallenges from "@/components/pages/dashboard/WeeklyChallenges";
import Leaderboard from "@/components/pages/dashboard/Leaderboard";
import Activity from "@/components/pages/dashboard/Activity";


type Contribution = { amount: number; status: string };
type Member = { user_id: string };

interface Squad {
  id: string;
  name: string;
  target_amount: number;
  balance: number;
  invite_code: string;
  contributions: Contribution[] | null;
  members: Member[] | null;
  // contributions: { length: number };
  // members: { user_id: string }[];
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const router = useRouter();

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
        if (!user.email_confirmed_at) {
          setError("Please verify your email address to access the dashboard. We can resend the verification email.");
          setLoading(false);
          return;
        }

        console.log(user, 'userr')

        // const { data, error } = await supabase
        //   .from("squads")
        //   .select("id, name, target_amount, invite_code, contributions:contributions(amount,status), members:squad_members(user_id)").or(`created_by.eq.${user.id},squad_members.user_id.eq.${user.id}`)
        //   .order("created_at", { ascending: false });
        const { data, error } = await supabase
          .rpc("get_user_squads", { user_uuid: user.id });
        const squads: Squad[] = (data || []) as Squad[];
        if (error) throw error;

        const withBalance = (squads || []).map((s) => ({
          id: s.id,
          name: s.name,
          target_amount: Number(s.target_amount || 0),
          invite_code: s.invite_code,
          balance: (s.contributions || []).reduce((acc: number, c) => acc + Number(c.amount || 0), 0),
          contributions: s.contributions || [],
          members: s.members || [],
        }));
        if (mounted) setSquads(withBalance);
      } catch (e) {
        const err = e instanceof Error ? e.message : "Failed to load dashboard";
        if (/schema cache|could not find the table|relation .* does not exist/i.test(err)) {
          setError(null);
          setSquads([]);
        } else {
          setError(err);
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
    const totalSaved = squads.reduce((acc, s) => acc + (s.balance || 0), 0);
    const totalTarget = squads.reduce((acc, s) => acc + (s.target_amount || 0), 0);
    const totalContribs = squads.reduce((acc, s) => acc + (s.contributions?.length || 0), 0);
    return { totalSaved, totalTarget, totalContribs };
  }, [squads]);

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contributions" },
        () => {
          (async () => {
            try {
              const { data, error } = await supabase
                .from("squads")
                .select("id, name, target_amount, invite_code, contributions:contributions(amount,status), members:squad_members(user_id)")
                .order("created_at", { ascending: false });
              if (!error) {
                const withBalance = (data || []).map((s) => ({
                  id: s.id,
                  name: s.name,
                  target_amount: Number(s.target_amount || 0),
                  invite_code: s.invite_code,
                  balance: (s.contributions || []).reduce((acc: number, c) => acc + Number(c.amount || 0), 0),
                  contributions: s.contributions || [],
                  members: s.members || [],
                }));
                setSquads(withBalance);
              }
            } catch { }
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
                const withBalance = (data || []).map((s) => ({
                  id: s.id,
                  name: s.name,
                  target_amount: Number(s.target_amount || 0),
                  invite_code: s.invite_code,
                  balance: (s.contributions || []).reduce((acc: number, c) => acc + Number(c.amount || 0), 0),
                  contributions: s.contributions || [],
                  members: s.members || [],
                }));
                setSquads(withBalance);
              }
            } catch { }
          })();
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch { }
    };
  }, []);

  const weekLabels = ["Mar 1 - 7", "Mar 8 - 14", "Mar 15 - 21", "Mar 22 - 28", "Final wk"];
  const weekData = [25000, 120000, 90000, 140000, 190000];

  const handleCopy = (code: string) => {
    const url = `${window.location.origin}/squads/join?code=${encodeURIComponent(code)}`;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <ProtectedRoute>

      <div className="space-y-6">
        {/* User Profile Section */}
        <UserProfile username="SaverPro" level="Level 4 Saver 🔥" progress={80} />

        {/* Alert Section (example: due contribution) */}
        {/* <Alert message="Contribution due tomorrow (Rent Squad)" /> */}


        {loading && <Spinner />}
        {error && <Alert message={error} />}

        {/* Contribution Overview Section */}
        <div className="flex gap-6 w-full">
          <div className="flex-6">
            <ContributionsSection
              saved={totals.totalSaved}
              target={totals.totalTarget}
              contribs={totals.totalContribs}
              squads={squads.length}
              streak={6} // Placeholder, replace with actual streak logic
            />
          </div>
          <div className="flex-4">
            <Badges />
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => router.push('/squads/new')} className="flex items-center gap-2">
            <PlusCircle />
            <p>Create Squad</p>
          </Button>
          <Button variant={'secondary'} onClick={() => router.push('/squads/join')} className="flex items-center gap-2">
            <Link2 />
            <p>Join Squad</p>
          </Button>
          <Button variant={'secondary'} onClick={() => router.push('/squads')} className="flex items-center gap-2">
            <Zap />
            <p>Quick Contribute</p>
          </Button>
        </div>

        <div className="flex gap-6 w-full">
          <div className="flex-6">
            <WeeklyChallenges
            />
          </div>
          <div className="flex-4">
            <Leaderboard />
          </div>
        </div>

        {/* Chart Section */}
        {/* <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm opacity-70">Last 30 days</div>
            <span className="badge-soft">Overview</span>
          </div>
          <SimpleBars data={weekData} labels={weekLabels} height={180} />
        </Card> */}

        {/* Your Squads Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold">Your Squads</div>
              <Link href="/squads" className="text-sm underline">See All</Link>
            </div>
            <SquadList
              squads={squads.map((s) => ({
                full_name: s.name,
                due: "Dec 12", // Placeholder, replace with actual due date
                saved: s.balance,
                target: s.target_amount,
                members: (s.members || []).map((m) => m.user_id),
                percent: Math.round(((s.balance || 0) / Math.max(1, s.target_amount)) * 100),
                active: true,
              }))}
            />
          </div>

          <div>
            <Activity />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

