import { supabase } from "@/lib/supabase/client";
import { ActivitiesType, BadgeType, ChallengesType, LeaderboardType } from "@/types/types";
import { create } from "zustand";

type DashboardStats = {
    user_id: string;
    total_saved: number;
    total_goals: number;
    contributions_count: number;
    active_squads: number;
};

type DashboardStoreType = {
    dashboardData: DashboardStats | null;
    badgesData: BadgeType[];
    leaderboardData: LeaderboardType | null;
    challengesData: ChallengesType | null;
    activitiesData: ActivitiesType | null;
    fetchDashboard: (userId: string) => Promise<void>;
    fetchBadges: (userId: string) => Promise<void>;
    fetchLeaderboard: (userId: string) => Promise<void>;
    fetchChallenges: (userId: string) => Promise<void>;
    fetchActivity: (userId: string) => Promise<void>;
};

export const useDashboardStore = create<DashboardStoreType>((set) => ({
    dashboardData: null,
    badgesData: [],
    leaderboardData: null,
    challengesData: null,
    activitiesData: null,

    fetchDashboard: async (userId: string) => {
        const { data } = await supabase
            .from("dashboard_stats")
            .select("*")
            .eq("user_id", userId)
            .single();

        set({ dashboardData: data });
    },
    fetchBadges: async (userId: string) => {
        const { data } = await supabase
            .from("badges")
            .select("*")
            .eq("user_id", userId)
            .returns<BadgeType[]>();

        set({ badgesData: data ?? [] });
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