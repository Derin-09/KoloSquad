"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Suggest verification
      await supabase.auth.resend({ type: "signup", email }).catch(() => {});
      window.location.href = "/dashboard";
    } catch (e: any) {
      setError(e?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          className="w-full rounded-md border border-[color:var(--accent)] focus:border-[color:var(--accent)] outline-none px-3 py-2 transition-colors"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          className="w-full rounded-md border border-[color:var(--accent)] focus:border-[color:var(--accent)] outline-none px-3 py-2 transition-colors"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading} className="w-full rounded-md bg-purple-600 text-white px-3 py-2 hover:bg-purple-700 transition-colors disabled:opacity-50">
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <div className="text-right text-sm">
        <a href="/reset-password" className="underline">Forgot password?</a>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
