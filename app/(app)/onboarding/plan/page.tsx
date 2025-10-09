"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function OnboardingPlan() {
  const router = useRouter();
  const [frequency, setFrequency] = useState("weekly");
  const [squad, setSquad] = useState("friends");

  async function finish() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (user) {
        await supabase.from("user_onboarding").upsert({
          user_id: user.id,
          frequency,
          squad,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      }
    } catch (e) {
      console.warn("onboarding plan save failed", e);
    }
    localStorage.setItem("ks_onboarding_plan", JSON.stringify({ frequency, squad }));
    localStorage.setItem("ks_onboarded", "1");
    router.replace("/dashboard");
  }

  return (
    <main className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Your saving plan</h1>
      <div>
        <label className="block text-sm">Contribution frequency</label>
        <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <div>
        <label className="block text-sm">Who are you saving with?</label>
        <select value={squad} onChange={(e) => setSquad(e.target.value)} className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors">
          <option value="friends">Friends</option>
          <option value="family">Family</option>
          <option value="coworkers">Coworkers</option>
        </select>
      </div>
      <button onClick={finish} className="rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-4 py-3 hover:brightness-95">
        Finish
      </button>
    </main>
  );
}