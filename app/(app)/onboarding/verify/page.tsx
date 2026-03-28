"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const p = params.get("phone");
    if (p) setPhone(p);
  }, [params]);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });
      if (error) throw error;
      // After successful verification, create profile if it doesn't exist
      // const { data: { user } } = await supabase.auth.getUser();
      // if (user) {
      //   // Check if profile exists
      //   const { data: profile, error: profileError } = await supabase
      //     .from('profiles')
      //     .select('id')
      //     .eq('id', user.id)
      //     .single();
      //   if (!profile && !profileError) {
      //     // Insert profile using metadata if available
      //     const { full_name, avatar_url } = user.user_metadata || {};
      //     await supabase.from('profiles').insert([
      //       {
      //         id: user.id,
      //         full_name: full_name || null,
      //         avatar_url: avatar_url || null,
      //       }
      //     ]);
      //   }
      // }

      // const { data: userData } = await supabase.auth.getUser();
      // const user = userData.user;

      // if (user) {
      //   const { data: existing } = await supabase
      //     .from("profiles")
      //     .select("id")
      //     .eq("id", user.id)
      //     .maybeSingle();

      //   if (!existing) {
      //     const { data: profilesInsert, error: insertError } = await supabase
      //       .from("profiles")
      //       .insert({
      //         id: user.id,
      //         full_name: user.user_metadata?.full_name ?? null,
      //         avatar_url: user.user_metadata?.avatar_url ?? null,
      //       });
      //       console.log('yeahhhh', profilesInsert)

      //     if (insertError) {
      //       console.log("Profile insert failed:", insertError);
      //     }
      //   }
      // }
      router.replace("/onboarding/goals");
    } catch (e) {
      const err = e instanceof Error ? e.message : "Invalid code. Try again.";
      setErr(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Enter OTP</h1>
      <p className="opacity-80 text-sm">We sent a code to {phone || "your phone"}.</p>
      <form onSubmit={verify} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">6-digit code</label>
          <input
            className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors tracking-widest"
            placeholder="000000"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-3 py-2 disabled:opacity-50">
          {loading ? "Verifying..." : "Verify"}
        </button>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
    </main>
  );
}
