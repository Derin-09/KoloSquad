"use client";

import { useEffect } from "react";
// import { useDashboardStore } from "@/stores/dashboard-store";
import { useSquadStore } from "@/stores/squad-store";
// import { useActivityStore } from "@/stores/activity-store";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

export default function AppInitializer() {
//   const fetchDashboard = useDashboardStore(
//     (s) => s.fetchDashboard
//   );

  const fetchSquads = useSquadStore(
    (s) => s.fetchSquad
  );

   const fetchUser = useAuthStore(
    (s) => s.fetchUser
  );

//   const fetchActivities = useActivityStore(
//     (s) => s.fetchActivities
//   );

  useEffect(() => {
    async function runForUser(userId: string) {
      await fetchUser();
      await fetchSquads(userId);
      // fetchDashboard(user.id)
      // fetchActivities(user.id)
    }

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;

      if (!userId) {
        await fetchUser();
        return;
      }

      await runForUser(userId);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const userId = session?.user?.id;
      if (!userId) {
        await fetchUser();
        return;
      }

      await runForUser(userId);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [fetchSquads, fetchUser]);

  return null;
}