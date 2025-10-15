"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import JoinSquadPage from "../join/page";

export default function NewSquadPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [target, setTarget] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSquad = async () => {
    setError(null);
    setLoading(true);
    // console.log('name is ' + name)
    // console.log('User:', (await supabase.auth.getUser()).data.user)
    try {




      

        const { data: sessionData } = await supabase.auth.getSession();
    console.log("SESSION TEST:", sessionData);

    // Check auth user
    const { data: { user } } = await supabase.auth.getUser();
    console.log("USER TEST:", user);

    // 🔥 TEST QUERY — directly read from squads
    const { data: testData, error: testError, status } = await supabase
      .from("squads")
      .select("*")
      .limit(1);

    console.log("TEST QUERY:", { status, testData, testError });






      const { data: auth } = await supabase.auth.getUser();
      console.log("USER DEBUG:", auth.user);
      console.log("Supabase url:", process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log("Supabase Anon:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      if (!auth.user) throw new Error("Sign in required");
      await supabase.auth.getSession();

      const invite = Math.random().toString(36).slice(2, 8).toUpperCase();
      const { data, error } = await supabase
        .from("squads")
        .insert({ name, target_amount: target, invite_code: invite, created_by: (await supabase.auth.getUser()).data.user?.id, created_at: new Date().toISOString() })
        .select("id")
        .single();
      if (error) throw error;
      await supabase.from("squad_members").insert({ squad_id: data.id, user_id: auth.user.id, role: "owner" });
      router.replace("/dashboard");
    } catch (e) {
        const err = e instanceof Error ? e.message :  "Failed to create squad";
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Create Squad</h1>

      <label className="block text-sm font-medium">Name</label>
      <input
        // className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2"

        className="w-full rounded-md border-2 border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Rent Gang"
      />

      <label className="block text-sm font-medium">Target (₦)</label>
      <input
        type="number"
        // className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2"

        className="w-full rounded-md border-2 border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
        value={target}
        onChange={(e) => setTarget(Number(e.target.value))}
      />

      <button
        onClick={createSquad}
        disabled={loading || !name || target <= 0}
        // className="w-full rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2 disabled:opacity-50"
        className="w-full rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-3 py-2 hover:brightness-95 text-sm"
      >
        {loading ? "Creating..." : "Create"}
      </button>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}


      <div className="pt-5">
        <JoinSquadPage />
      </div>
    </main>
  );
}
