"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("[LOGIN] Sign in response:", { hasSession: !!data.session, userId: data.user?.id ?? "none", error: error?.message ?? "none" });
      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("confirm") || msg.includes("not confirmed")) {
          // Email not confirmed; resend and inform the user.
          await supabase.auth.resend({ type: "signup", email }).catch(() => {});
          setError("Please check your email to verify your account. We just sent you a new link.");
          return;
        }
        throw error;
      }
      // Hydrate auth store before redirecting so user is ready when dashboard loads
      console.log("[LOGIN] Calling fetchUser...");
      try {
        const fetchUserPromise = fetchUser();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("fetchUser timeout")), 3000)
        );
        await Promise.race([fetchUserPromise, timeoutPromise]);
        console.log("[LOGIN] fetchUser completed, redirecting to dashboard");
      } catch (fetchErr) {
        console.warn("[LOGIN] fetchUser failed or timed out, redirecting anyway:", fetchErr);
      }
      // Success - redirect even if fetchUser had issues
      // window.location.href = "/dashboard";
      router.push("/dashboard")
    } catch (e) {
        console.error("[LOGIN] Error during sign in:", e);
        const err = e instanceof Error ? e.message :  "Sign in failed";
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Email</label>
        <input
className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Password</label>
        <input
className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading} className="w-full rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-3 py-2 hover:brightness-95 transition-colors disabled:opacity-50">
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <div className="text-right text-sm">
        <a href="/reset-password" className="underline">Forgot password?</a>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
