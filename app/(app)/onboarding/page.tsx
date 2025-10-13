"use client";

import { useRouter } from "next/navigation";

export default function OnboardingIntro() {
  const router = useRouter();
  return (
    <main className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Welcome to KoloSquad!</h1>
      <p className="opacity-80">Let&apos;s personalize your saving journey with a few quick questions.</p>
      <button onClick={() => router.push("/onboarding/goals")} className="rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-4 py-3 hover:brightness-95">
        Get started
      </button>
    </main>
  );
}