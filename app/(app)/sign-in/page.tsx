"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"input" | "otp" | "sent">("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appUrl = useMemo(() =>
    (typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000",
  []);

  function normalizePhone(input: string) {
    let v = input.trim().replace(/\s+/g, "");
    // Nigeria helper: 0xxxxxxxxxx -> +234xxxxxxxxxx
    if (/^0\d{10}$/.test(v)) v = "+234" + v.slice(1);
    return v;
  }

  async function sendOtp() {
    setError(null);
    setLoading(true);
    try {
      if (mode === "phone") {
        const p = normalizePhone(phone);
        const { error } = await supabase.auth.signInWithOtp({
          phone: p,
          options: { channel: "sms", shouldCreateUser: true },
        });
        if (error) throw error;
        setStep("otp");
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true, emailRedirectTo: appUrl + "/dashboard" },
        });
        if (error) throw error;
        setStep("sent");
      }
    } catch (e: any) {
      let msg = e?.message || "Failed to send OTP";
      if (mode === "phone" && /unsupported phone provider/i.test(msg)) {
        msg = "SMS provider not configured. Use Email sign-in for now or configure Phone provider in Supabase.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (mode !== "phone") return;
    setError(null);
    setLoading(true);
    try {
      const p = normalizePhone(phone);
      const { error, data } = await supabase.auth.verifyOtp({ phone: p, token: code.trim(), type: "sms" });
      if (error) throw error;
      if (data?.session) router.replace("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">Use your phone (OTP) or email.</p>
      </div>

      {/* Toggle */}
      <div className="grid grid-cols-2 rounded-md border" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => { setMode("phone"); setStep("input"); setError(null); }}
          className={`px-3 py-2 text-sm ${mode === "phone" ? "bg-[color:var(--muted)] font-medium" : "opacity-80"}`}
        >
          Phone
        </button>
        <button
          onClick={() => { setMode("email"); setStep("input"); setError(null); }}
          className={`px-3 py-2 text-sm ${mode === "email" ? "bg-[color:var(--muted)] font-medium" : "opacity-80"}`}
        >
          Email
        </button>
      </div>

      {/* Input step */}
      {step === "input" && (
        <div className="space-y-3">
          {mode === "phone" ? (
            <>
              <label className="block text-sm font-medium">Phone number</label>
              <input
                className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2"
                placeholder="e.g. +2348012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs opacity-70">Tip: 0xxxxxxxxxx will be normalized to +234xxxxxxxxxx.</p>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium">Email address</label>
              <input
                type="email"
                className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          )}
          <button onClick={sendOtp} disabled={loading || (mode === "phone" ? !phone : !email)} className="w-full rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2 disabled:opacity-50">
            {loading ? "Sending..." : mode === "phone" ? "Send OTP" : "Send sign-in link"}
          </button>
        </div>
      )}

      {/* Phone OTP step */}
      {mode === "phone" && step === "otp" && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">Enter OTP</label>
          <input
            className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 tracking-widest"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={verifyOtp} disabled={loading || code.length < 4} className="w-full rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2 disabled:opacity-50">
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
          <button onClick={() => setStep("input")} className="w-full text-sm underline opacity-70">Change phone</button>
        </div>
      )}

      {/* Email sent step */}
      {mode === "email" && step === "sent" && (
        <div className="space-y-3">
          <p className="text-sm">We sent a sign-in link to <span className="font-medium">{email}</span>. Open it on this device to continue.</p>
          <button onClick={() => setStep("input")} className="w-full text-sm underline opacity-70">Use a different email</button>
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </main>
  );
}
