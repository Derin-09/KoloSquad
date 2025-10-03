import Link from "next/link";

export default function Home() {
  return (
    <main className="font-sans flex flex-col gap-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">KoloSquad</h1>
        <p className="text-neutral-600 dark:text-neutral-300">Save together. Flex together.</p>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
          <h2 className="font-semibold mb-2">Get Started</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              <Link className="underline" href="/sign-in">Sign in with phone (OTP)</Link>
            </li>
            <li>
              <Link className="underline" href="/dashboard">Open Dashboard</Link>
            </li>
            <li>
              <Link className="underline" href="/squads/new">Create a Squad</Link>
            </li>
            <li>
              <Link className="underline" href="/flex">Export a Flex Card</Link>
            </li>
          </ul>
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
          <h2 className="font-semibold mb-2">Setup Checklist</h2>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Set NEXT_PUBLIC_SUPABASE_URL and keys in .env.local</li>
            <li>Run the SQL in supabase/schema.sql</li>
            <li>Optionally set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</li>
          </ol>
        </div>
      </section>
    </main>
  );
}
