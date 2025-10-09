"use client";

import Image from "next/image";
import { SignupForm } from "@/components/signup-form";

export default function SignUpPage() {
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
            <h1 className="text-2xl font-bold">Create your free account</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Join KoloSquad and start saving with your squad.</p>
          </div>
          <SignupForm />
        </div>
      </section>
      <aside className="relative hidden md:block">
        <Image src="/image/medium-shot-student-with-smartphone.jpg" alt="People saving together" fill className="object-cover" priority />
      </aside>
    </main>
  );
}
