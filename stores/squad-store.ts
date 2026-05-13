import { supabase } from "@/lib/supabase/client";
import { Contribution, Member, Squad } from "@/types/types";
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

type SquadStore = {
    stats: Squad[] | null;
    isLoading: boolean;
    isError: boolean;
    fetchSquad: (userId: string) => Promise<void>
    refreshSquads: () => Promise<void>
    startRealtime: () => void
    stopRealtime: () => void
}

export const useSquadStore = create<SquadStore>((set, get) => ({
    stats: null,
    isLoading: false,
    isError: false,
    fetchSquad: async (userId: string) => {
        set({ isLoading: true, isError: false })
        const { data, error } = await supabase
        .rpc("get_user_squads", { user_uuid: userId });

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
        isLoading: false
    })

    error && set({
        isError: true
    })
    },
    refreshSquads: async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) return;
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