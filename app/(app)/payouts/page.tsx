export default function PayoutsPage() {
  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Payouts</h1>
          <p className="text-sm opacity-70">Track requested and received payouts.</p>
        </div>
        <button className="rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-3 py-2 hover:brightness-95 text-sm">Request payout</button>
      </header>

      <section className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Pending</h2>
          <span className="badge-soft">Awaiting approval</span>
        </div>
        <div className="text-sm opacity-70">No pending payouts.</div>
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">History</h2>
          <span className="badge-soft">Last 90 days</span>
        </div>
        <div className="text-sm opacity-70">No payout history yet.</div>
      </section>
    </main>
  );
}
