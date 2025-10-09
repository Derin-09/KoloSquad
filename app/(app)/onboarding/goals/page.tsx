"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function OnboardingGoals() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [target, setTarget] = useState("");

  async function next() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (user) {
        await supabase.from("user_onboarding").upsert({
          user_id: user.id,
          goal,
          target_amount: target ? Number(target) : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      }
    } catch (e) {
      console.warn("onboarding goals save failed", e);
    }
    localStorage.setItem("ks_onboarding_goal", JSON.stringify({ goal, target }));
    router.push("/onboarding/plan");
  }

  return (
    <main className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">What are you saving for?</h1>
      <div>
        <label className="block text-sm">Saving goal</label>
        <input value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors" placeholder="E.g. New phone, Travel, Rent" />
      </div>
      <div>
        <label className="block text-sm">Target amount (optional)</label>
        <input value={target} onChange={(e) => setTarget(e.target.value)} className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors" placeholder="E.g. 200000" />
      </div>
      <button onClick={next} className="rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-4 py-3 hover:brightness-95">
        Continue
      </button>
    </main>
  );
}