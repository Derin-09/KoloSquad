"use client";

import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function SignInPage() {
  return (
    <main className="relative min-h-screen md:pr-[50vw]">
      {/* Fixed right-side image panel */}
      <aside className="hidden md:block fixed inset-y-0 right-0 w-1/2">
        <Image src="/image/medium-shot-student-with-smartphone.jpg" alt="People saving together" fill className="object-cover" priority />
      </aside>

      {/* Left content */}
      <section className="flex min-h-screen items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md space-y-6">
          <div>
            <a href="/" className="inline-flex items-center gap-2 opacity-90 hover:opacity-100">
              <Image src="/vector/default-monochrome-black.svg" alt="KoloSquad" width={140} height={28} />
            </a>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Sign in to continue.</p>
          </div>
          <LoginForm />
          <div className="text-sm">
            Don’t have an account? <a className="underline" href="/sign-up">Create one</a>
          </div>
        </div>
      </section>
    </main>
  );
}
