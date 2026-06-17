import { supabase } from "@/lib/supabase/client";
import { ActivitiesType, BadgeCatalogType, BadgeType, ChallengesType, LeaderboardType } from "@/types/types";
import { create } from "zustand";

type DashboardStats = {
    user_id: string;
    total_saved: number;
    total_goals: number;
    xp?: number;
    level?: number;
    total_contributions: number;
    active_squads: number;
};

type DashboardStoreType = {
    dashboardData: DashboardStats | null;
    badgesData: BadgeType[];
    badgesCatalogData: BadgeCatalogType[];
    leaderboardData: LeaderboardType | null;
    challengesData: ChallengesType | null;
    activitiesData: ActivitiesType | null;
    fetchDashboard: (userId: string) => Promise<void>;
    fetchBadges: (userId: string) => Promise<void>;
    fetchBadgesCatalog: () => Promise<void>;
    fetchLeaderboard: (userId: string) => Promise<void>;
    fetchChallenges: (userId: string) => Promise<void>;
    fetchActivity: (userId: string) => Promise<void>;
};

export const useDashboardStore = create<DashboardStoreType>((set) => ({
    dashboardData: null,
    badgesData: [],
    badgesCatalogData: [],
    leaderboardData: null,
    challengesData: null,
    activitiesData: null,

    fetchDashboard: async (userId: string) => {
        const { data, error } = await supabase
            .from("user_stats")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (error) {
            console.error("fetchDashboard failed:", error.message);
            set({ dashboardData: null });
            return;
        }

        set({ dashboardData: data });
    },
    fetchBadges: async (userId: string) => {
        const { data, error } = await supabase
            .from("user_badges")
            .select("*")
            .eq("user_id", userId);
            // .returns<BadgeType[]>();

        if (error) {
            console.error("fetchBadges failed:", error.message);
            set({ badgesData: [] });
            return;
        }

        set({ badgesData: data ?? [] });
    },
    fetchBadgesCatalog: async () => {
        const { data, error } = await supabase
            .from("badges_catalog")
            .select("*");
            // .returns<BadgeCatalogType[]>();

        if (error) {
            console.error("fetchBadgesCatalog failed:", error.message);
            set({ badgesCatalogData: [] });
            return;
        }

        set({ badgesCatalogData: data ?? [] });
    },
    fetchLeaderboard: async (userId: string) => {
        const { data } = await supabase
            .from("squad_leaderboard")
            .select("*")
            .eq("user_id", userId)
            .single();

        set({ leaderboardData: data });
    },
    fetchChallenges: async (userId: string) => {
        const { data } = await supabase
            .from("challenges")
            .select("*")
            .eq("user_id", userId)
            .single();

        set({ challengesData: data });
    },
    fetchActivity: async (userId: string) => {
        const { data } = await supabase
            .from("activities")
            .select("*")
            .eq("user_id", userId)
            .single();

        set({ activitiesData: data });
    },
}))