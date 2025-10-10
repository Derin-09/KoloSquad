"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function PhoneOnboardingPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: { channel: "sms" },
      });
      if (error) throw error;
      setMsg("OTP sent. Check your SMS.");
      router.push(`/onboarding/verify?phone=${encodeURIComponent(phone)}`);
    } catch (e: any) {
      setErr(e?.message || "Failed to send OTP. Is SMS provider configured?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Verify your phone</h1>
      <p className="opacity-80 text-sm">We will send a one-time code to your phone number.</p>
      <form onSubmit={sendOtp} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Phone number</label>
          <input
            className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
            placeholder="e.g. +2348012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-3 py-2 disabled:opacity-50">
          {loading ? "Sending..." : "Send OTP"}
        </button>
        {msg && <p className="text-sm text-green-600">{msg}</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
    </main>
  );
}
