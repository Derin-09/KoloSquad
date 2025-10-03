"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizePhone = (p: string) => {
    return p.trim();
  };

  const requestOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const p = normalizePhone(phone);
      const { error } = await supabase.auth.signInWithOtp({
        phone: p,
        options: { channel: "sms" },
      });
      if (error) throw error;
      setStep("otp");
    } catch (e: any) {
      setError(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const p = normalizePhone(phone);
      const { error, data } = await supabase.auth.verifyOtp({
        phone: p,
        token: code.trim(),
        type: "sms",
      });
      if (error) throw error;
      if (data?.session) {
        router.replace("/dashboard");
      }
    } catch (e: any) {
      setError(e.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">Use your phone number to receive an OTP.</p>
      </div>

      {step === "phone" && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">Phone number</label>
          <input
            className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2"
            placeholder="e.g. +2348012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={requestOtp} disabled={loading || !phone} className="w-full rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2 disabled:opacity-50">
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </div>
      )}

      {step === "otp" && (
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
          <button onClick={() => setStep("phone")} className="w-full text-sm underline opacity-70">Change phone</button>
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </main>
  );
}
