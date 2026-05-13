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
import { useSquadStore } from "@/stores/squad-store";
import { useAuthStore } from "@/stores/auth-store";
import { useDashboardStore } from "@/stores/dashboard-store";


export default function DashboardPage() {
  // const [squads, setSquads] = useState<Squad[]>([]);
  const [error, setError] = useState<string | null>(null);
  // const [dashboardData, setDashboardData] = useState(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const router = useRouter();

  const squads = useSquadStore((state) => state.stats)
  // const user = useAuthStore((state) => state.user)
  // const dashboardData = useDashboardStore((state) => state.dashboardData)
  // const fetchDashboard = useDashboardStore((state) => state.fetchDashboard)
  const { isLoading, isError, refreshSquads, startRealtime, stopRealtime } = useSquadStore()

  useEffect(() => {
    void refreshSquads()
    startRealtime()

    return () => {
      stopRealtime()
    }
  }, [refreshSquads, startRealtime, stopRealtime])

  // useEffect(() => {
  //   // const fetchDashboard = async () => {
  //   //   const { data } = await supabase
  //   //     .from("dashboard_stats")
  //   //     .select("*")
  //   //     .eq("user_id", user?.id)
  //   //     .single();

  //   //     setDashboardData(data);
  //   // }
  //   user && fetchDashboard(user?.id);

  // }, [])

  const squadsList = squads ?? [];

  const totals = useMemo(() => {
    const totalSaved = squadsList.reduce((acc, s) => acc + (s.balance || 0), 0);
    const totalTarget = squadsList.reduce((acc, s) => acc + (s.target_amount || 0), 0);
    const totalContribs = squadsList.reduce((acc, s) => acc + (s.contributions?.length || 0), 0);
    return { totalSaved, totalTarget, totalContribs };
  }, [squadsList]);


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

      <div className="space-y-6 max-w-7xl mx-auto">
        {/* User Profile Section */}
        <UserProfile username="SaverPro" level="Level 4 Saver 🔥" progress={80} />

        {/* Alert Section (example: due contribution) */}
        {/* <Alert message="Contribution due tomorrow (Rent Squad)" /> */}


        {isLoading && <Spinner />}
        {error && <Alert message={error} />}

        {/* Contribution Overview Section */}
        <div className="flex gap-6 w-full">
          <div className="flex-6">
            <ContributionsSection
              saved={totals.totalSaved}
              target={totals.totalTarget}
              contribs={totals.totalContribs}
              squads={squadsList.length}
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
              squads={squadsList.map((s) => ({
                full_name: s.name,
                due: "Dec 12", // Placeholder, replace with actual due date
                saved: Number(s.balance || 0),
                target: Number(s.target_amount || 0),
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

