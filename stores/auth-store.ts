import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { create } from "zustand";

type AuthStoreType = {
    fetchUser: () => Promise<void>
    user: User | null
}
export const useAuthStore = create<AuthStoreType>((set, get) => ({
    user: null,
    fetchUser: async () => {
        const { data } = await supabase.auth.getUser()

        set( { user: data.user})
    },
}))