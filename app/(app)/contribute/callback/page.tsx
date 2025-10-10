"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ContributionCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState<string>("Verifying payment...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (!reference) {
      setStatus("failed");
      setMessage("Missing transaction reference.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`);
        const json = await res.json();
        if (!res.ok || json.status !== "success") {
          setStatus("failed");
          setMessage(json.message || "Payment verification failed.");
          return;
        }
        setStatus("success");
        setMessage("Payment verified! Your contribution has been recorded.");
      } catch (e: any) {
        setStatus("failed");
        setMessage(e?.message || "Verification error");
      }
    })();
  }, []);

  return (
    <main className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Contribution</h1>
      <div className={`card p-4 ${status === "failed" ? "text-red-600" : status === "success" ? "text-green-700" : ""}`}>
        {message}
      </div>
      <button onClick={() => router.replace("/dashboard")} className="rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-4 py-2">Go to dashboard</button>
    </main>
  );
}
