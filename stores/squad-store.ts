import { supabase } from "@/lib/supabase/client";
import { Contribution, Member, MemberType, Squad } from "@/types/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { create } from 'zustand'

let squadRealtimeChannel: RealtimeChannel | null = null;

type SquadStats = {
    id: string;
    name: string;
    target_amount: number;
    balance: number;
    invite_code: string;
    contributions: Contribution[] | null;
    members: Member[] | null;
}

type ContribType = {
    amount: number,
    status: string,
    created_at: string
}

type SingleSquad= {
    members: MemberType[], 
    squad: Squad | null, 
    contributions: ContribType[] | null, 
    totalSaved: number
}

type SquadStore = {
    stats: Squad[] | null;
    isLoading: boolean;
    isError: boolean;
    createSquad: (payload: {
        userId: string;
        name: string;
        targetAmount: number;
        duration: "week(s)" | "month(s)" | "year(s)";
        durationNumber?: number;
        memberCount: number;
        amountPerMember: number;
        frequency: "weekly" | "monthly" | "yearly";
        rewards: string[];
        penalties: string[];
    }) => Promise<{ id: string; name: string; target_amount: number; invite_code: string; created_by: string }>;
    fetchSquad: (userId: string) => Promise<void>
    fetchSingleSquad: (squadId: string) => Promise<SingleSquad>
    refreshSquads: () => Promise<void>
    startRealtime: () => void
    stopRealtime: () => void
}

export const useSquadStore = create<SquadStore>((set, get) => ({
    stats: null,
    isLoading: false,
    isError: false,
    createSquad: async ({
        userId,
        name,
        targetAmount,
        duration,
        durationNumber,
        memberCount,
        amountPerMember,
        frequency,
        rewards,
        penalties,
    }) => {
        const withTimeout = async <T,>(query: PromiseLike<T>, ms = 15000): Promise<T> => {
            return await Promise.race([
                Promise.resolve(query),
                new Promise<T>((_, reject) => {
                    setTimeout(() => reject(new Error("Request timed out. Please try again.")), ms);
                }),
            ]);
        };

        const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();

        const { data: squad, error: squadError } = await withTimeout(
            supabase
                .from("squads")
                .insert({
                    name,
                    target_amount: targetAmount,
                    invite_code: inviteCode,
                    created_by: userId,
                    duration,
                    duration_number: durationNumber,
                    member_count: memberCount,
                    amount_per_member: amountPerMember,
                    frequency,
                    rewards,
                    penalties,
                })
                .select("id, name, target_amount, invite_code, created_by")
                .single()
        );

        if (squadError || !squad) {
            throw squadError ?? new Error("Failed to create squad");
        }

        const { error: memberError } = await withTimeout(
            supabase.from("squad_members").insert({
                squad_id: squad.id,
                user_id: userId,
                role: "owner",
            })
        );

        if (memberError) {
            throw memberError;
        }

        const today = new Date().toISOString().split("T")[0];
        const { error: planError } = await withTimeout(
            supabase.from("contribution_plans").insert({
                squad_id: squad.id,
                created_by: userId,
                user_id: userId,
                frequency,
                amount: 1000,
                type: "pooled",
                start_date: today,
                next_due_date: today,
                end_date: today,
            })
        );

        if (planError) {
            throw planError;
        }

        // Refresh in background so create action does not get stuck waiting on RPC.
        void get().fetchSquad(userId);

        return squad;
    },
    fetchSquad: async (userId: string) => {
        set({ isLoading: true, isError: false })

        try {
            const { data, error } = await supabase
                .rpc("get_user_squads", { user_uuid: userId });

            if (error) {
                set({ isError: true });
                return;
            }

            const mapped: Squad[] = ((data || []) as any[]).map((s) => {
                const contributions = (s?.contributions || []) as Contribution[];
                const members = (s?.members || []) as Member[];
                const computedBalance = contributions.reduce(
                    (acc: number, c) => acc + Number(c?.amount || 0),
                    0
                );

                return {
                    id: String(s?.id || ""),
                    name: String(s?.name || ""),
                    target_amount: Number(s?.target_amount || 0),
                    balance: Number(s?.balance ?? computedBalance),
                    invite_code: String(s?.invite_code || ""),
                    contributions,
                    members,
                };
            });

            set({
                stats: mapped,
                isError: false,
            });
        } catch (e) {
            set({ isError: true });
            console.error("fetchSquad failed:", e);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchSingleSquad: async (squadId: string) => {
        let sorted: MemberType[] = []
        const { data: squadData, error: squadError } = await supabase
            .from("squads")
            .select("id, name, target_amount, invite_code, created_by")
            .eq("id", squadId)
            .maybeSingle();

        if (squadError) console.error("Squad fetch error:", squadError);
        // else setSquad(squadData);

        const { data: memberData, error: memberError } = await supabase
            .from("squad_member_contributions")
            // .from("contributions")
            .select("*")
            .eq("squad_id", squadId);


        if (memberError) {
            console.error("Member fetch error:", memberError);
        } else {
            const mapped: MemberType[] = (memberData || []).map((m) => ({
                user_id: m.user_id,
                role: m.role,
                profiles: {
                    full_name: m.full_name,
                    avatar_url: m.avatar_url,
                },
                total_contributed: m.total_contributed,
            }));

            sorted = mapped.sort((a, b) =>
                a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0
            );

        }

        // Fetch contributions
        const { data: contribData } = await supabase
            .from("contributions")
            .select("amount, status, created_at")
            .eq("squad_id", squadId)
            .order("created_at", { ascending: false });

        const total =
            contribData
                ?.filter((c) => c.status === "successful")
                .reduce((sum, c) => sum + c.amount, 0) || 0;

        
            const result: SingleSquad = { members: sorted, squad: squadData, contributions: contribData, totalSaved: total}

            return result
    },

    refreshSquads: async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
            set({ isLoading: false });
            return;
        }
        await get().fetchSquad(data.user.id);
    },
    startRealtime: () => {
        if (squadRealtimeChannel) return;

        squadRealtimeChannel = supabase
            .channel("squad-store-updates")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "contributions" },
                () => {
                    void get().refreshSquads();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "squad_members" },
                () => {
                    void get().refreshSquads();
                }
            )
            .subscribe();
    },
    stopRealtime: () => {
        if (!squadRealtimeChannel) return;
        void supabase.removeChannel(squadRealtimeChannel);
        squadRealtimeChannel = null;
    }

}))