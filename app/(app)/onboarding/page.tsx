"use client";

import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingIntro() {
  const router = useRouter();

  useEffect(() => {
  async function createProfileIfNeeded() {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.log("User fetch failed:", userError);
      return;
    }

    const user = userData.user;
    if (!user) return;

    const { data: existing, error: selectError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (selectError) {
      console.log("Profile check failed:", selectError);
      return;
    }

    if (!existing) {
      const { data: insertData, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
        });
        console.log('dataaa', insertData)

      if (insertError) {
        console.log("Insert failed:", insertError);
      } else {
        console.log("Profile created");
      }
    }
  }

  createProfileIfNeeded();
}, []);
  return (
    <main className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Welcome to KoloSquad!</h1>
      <p className="opacity-80">Let&apos;s personalize your saving journey with a few quick questions.</p>
      <button onClick={() => router.push("/onboarding/goals")} className="rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-4 py-3 hover:brightness-95">
        Get started
      </button>
    </main>
  );
}