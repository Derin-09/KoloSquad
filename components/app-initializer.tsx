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
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await Promise.all([
        // fetchDashboard(user.id),
        fetchSquads(user.id),
        fetchUser(),
        // fetchActivities(user.id),
      ]);
    }

    init();
  }, []);

  return null;
}