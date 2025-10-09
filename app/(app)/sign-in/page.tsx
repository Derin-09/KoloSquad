"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appUrl = useMemo(() =>
    (typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000",
  []);

  async function onEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Send verification email after sign-in (resend signup verification)
      await supabase.auth.resend({ type: "signup", email }).catch(() => {});

      router.replace("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: appUrl + "/sign-up" },
      });
      if (error) throw error;
      // Redirect happens via OAuth; as fallback, push to sign-up
      router.push("/sign-up");
    } catch (e: any) {
      setError(e?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">Welcome back. Sign in to continue.</p>
      </div>

      <form onSubmit={onEmailSignIn} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Email address</label>
          <input
            type="email"
            className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2 disabled:opacity-50">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="text-center text-sm opacity-70">or</div>

      <button onClick={onGoogleSignIn} disabled={loading} className="w-full rounded-md border px-3 py-2 hover:bg-[color:var(--muted)] transition-colors disabled:opacity-50">
        Continue with Google
      </button>

      <div className="text-sm">
        Don’t have an account? <a className="underline" href="/sign-up">Create one</a>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </main>
  );
}
