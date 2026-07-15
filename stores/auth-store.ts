import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { create } from "zustand";

type SignupPayload = {
    email: string;
    password: string;
    fullName: string;
    avatarUrl?: string;
    emailRedirectTo: string;
};

type SignupResult = {
    requiresEmailVerification: boolean;
};

type Profile = {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
};

type AuthStoreType = {
    fetchUser: () => Promise<void>
    signupUser: (payload: SignupPayload) => Promise<SignupResult>
    user: User | null
    profile: Profile | null
}
export const useAuthStore = create<AuthStoreType>((set, get) => ({
    user: null,
    profile: null,
    fetchUser: async () => {
        console.log("[AUTH STORE] fetchUser called");

        // const { data, error } = await supabase.auth.getUser();
        // console.log("[AUTH STORE] getUser result:", { hasError: !!error, userId: data?.user?.id ?? "none" });

        console.log("[AUTH STORE] before getUser");

        const result = await supabase.auth.getUser();

        console.log("[AUTH STORE] after getUser", result);

        // if (error) {
        //     console.error("[AUTH STORE] auth.getUser failed:", error.message);
        //     set({ user: null, profile: null });
        //     return;
        // }

        if (result.error) {
            console.error("[AUTH STORE] auth.getUser failed:", result.error.message);
            set({ user: null, profile: null });
            return;
        }

        // const user = data.user
        const user = result.data.user

        set({ user });

        // Create post-auth records only after we have an authenticated user.
        if (!user) {
            set({ profile: null });
            return;
        }

        const fullName = (user.user_metadata?.full_name as string | undefined) ?? null;
        const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null;

        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .upsert(
                {
                    id: user.id,
                    full_name: fullName,
                    avatar_url: avatarUrl,
                },
                { onConflict: "id" }
            )
            .select("id, full_name, avatar_url")
            .single();

        if (profileError) {
            console.error("profiles upsert failed:", profileError.message);
        } else {
            set({ profile: profileData });
        }


        const { error: statsError } = await supabase
            .from("user_stats")
            .upsert(
                {
                    user_id: user.id,
                },
                { onConflict: "user_id" }
            );

        if (statsError) {
            console.error("user_stats upsert failed:", statsError.message);
        }
    },
    signupUser: async ({ email, password, fullName, avatarUrl, emailRedirectTo }: SignupPayload) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, avatar_url: avatarUrl },
                emailRedirectTo,
            },
        });

        if (error) throw error;

        set({ user: data.user ?? null });

        // If auto-confirm is enabled and session exists, create records now.
        if (data.session) {
            await get().fetchUser();
        }

        return { requiresEmailVerification: !data.session };
    },
}))



// fetchUser: async () => {
//         console.log("[AUTH STORE] fetchUser called");
//         const { data: sessionData } = await supabase.auth.getSession();
//         console.log("[AUTH STORE] getSession result:", sessionData.session?.user?.id ?? "no user");
//         const sessionUser = sessionData.session?.user ?? null;

//         // Use local session immediately so UI can hydrate even if network is flaky.
//         set({ user: sessionUser });
//         console.log("[AUTH STORE] Set user in store:", sessionUser?.id ?? "null");

//         const { data, error } = await supabase.auth.getUser();
//         console.log("[AUTH STORE] getUser result:", { hasError: !!error, userId: data?.user?.id ?? "none" });
//         if (error) {
//             console.error("[AUTH STORE] auth.getUser failed:", error.message);

//             // Keep session-backed user if available; do not wipe auth state on transient failures.
//             if (!sessionUser) {
//                 set({ user: null, profile: null });
//             }
//             return;
//         }

//         const user = data.user ?? sessionUser;
//         set({ user });

//         // Create post-auth records only after we have an authenticated user.
//         if (!user) {
//             set({ profile: null });
//             return;
//         }

//         const fullName = (user.user_metadata?.full_name as string | undefined) ?? null;
//         const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null;

//         const { data: profileData, error: profileError } = await supabase
//             .from("profiles")
//             .upsert(
//                 {
//                     id: user.id,
//                     full_name: fullName,
//                     avatar_url: avatarUrl,
//                 },
//                 { onConflict: "id" }
//             )
//             .select("id, full_name, avatar_url")
//             .single();

//         if (profileError) {
//             console.error("profiles upsert failed:", profileError.message);
//         } else {
//             set({ profile: profileData });
//         }


//         const { error: statsError } = await supabase
//             .from("user_stats")
//             .upsert(
//                 {
//                     user_id: user.id,
//                 },
//                 { onConflict: "user_id" }
//             );

//         if (statsError) {
//             console.error("user_stats upsert failed:", statsError.message);
//         }
//     },