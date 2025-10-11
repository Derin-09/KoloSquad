export default function ContributionsPage() {
  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Contributions</h1>
          <p className="text-sm opacity-70">Your recent and scheduled contributions.</p>
        </div>
        <a href="/squads/new" className="rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-3 py-2 hover:brightness-95 text-sm">New Squad</a>
      </header>

      <section className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Recent</h2>
          <span className="badge-soft">Last 30 days</span>
        </div>
        <div className="text-sm opacity-70">
          No contributions yet. When you start contributing to a squad, they&apos;ll show up here.
        </div>
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Scheduled</h2>
          <span className="badge-soft">Upcoming</span>
        </div>
        <div className="text-sm opacity-70">
          You have no scheduled contributions.
        </div>
      </section>
    </main>
  );
}
