"use client";

import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function SignInPage() {
  return (
    <main className="grid min-h-[80vh] grid-cols-1 md:grid-cols-2">
      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md space-y-6">
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100">
              <span className="font-semibold">KoloSquad</span>
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
      <aside className="relative hidden md:block">
        <Image src="/image/medium-shot-student-with-smartphone.jpg" alt="People saving together" fill className="object-cover" priority />
      </aside>
    </main>
  );
}
