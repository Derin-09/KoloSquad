"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export default function JoinSquadPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const c = params.get("code");
    if (c) setCode(c);
  }, [params]);

  async function join() {
  setError(null);
  setLoading(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sign in required");

    const { data: squad, error: qerr } = await supabase
      .from("squads")
      .select("id, invite_code")
      .eq("invite_code", code.trim().toUpperCase())
      .maybeSingle(); // handles not found gracefully

    if (qerr) throw qerr;
    if (!squad) throw new Error("Invalid invite code");

    const { error: insertError } = await supabase.from("squad_members").insert([
  {
    squad_id: squad.id,
    user_id: user.id,
    role: "member",
    display_name: user.user_metadata.full_name || user.email || "Anonymous"
  }
]);

    // await supabase
    //   .from("squad_members")
    //   .upsert(
    //     { squad_id: squad.id, user_id: user.id, role: "member" },
    //     { onConflict: "squad_id,user_id" }
    //   );
    if (insertError) throw insertError;

    router.replace("/dashboard");
  } catch (e) {
    const err = e instanceof Error ? e.message : "Failed to join squad";
    setError(err);
  } finally {
    setLoading(false);
  }
}


  // async function join() {
  //   setError(null);
  //   setLoading(true);
  //   try {
  //     const { data: auth } = await supabase.auth.getUser();
  //     if (!auth.user) throw new Error("Sign in required");
  //     const { data: squad, error: qerr } = await supabase
  //       .from("squads")
  //       .select("id")
  //       .eq("invite_code", code.trim().toUpperCase())
  //       .single();
  //     if (qerr) throw qerr;
  //     console.log("squad", squad);

  //     await supabase.from("squad_members").upsert({ squad_id: squad.id, user_id: auth.user.id, role: "member" }, { onConflict: "squad_id,user_id" });
  //     router.replace("/dashboard");
  //   } catch (e) {
  //     const err = e instanceof Error ? e.message :  "Failed to join squad";
  //     setError(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  return (
    <main className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Join Squad</h1>
      <label className="block text-sm font-medium">Invite code</label>
      <input
        className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="e.g. 8F2KQZ"
      />
      <button
        onClick={join}
        disabled={loading || code.trim().length < 4}
        className="w-full rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-3 py-2 disabled:opacity-50"
      >
        {loading ? "Joining..." : "Join"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
}

// http://localhost:3000/squads/join?code=N4MHKL
