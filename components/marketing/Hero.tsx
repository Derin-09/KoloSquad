export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute -z-10 inset-0">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-40 bg-[color:var(--accent)]" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-30 bg-[color:var(--accent)]" />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 badge-soft">New: Group saving made social</div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">The smarter way to save with your squad</h1>
          <p className="text-lg opacity-80">KoloSquad helps you save together with friends using squads, reminders and milestones. Build consistency, hit goals faster, and flex your wins.</p>
          <div className="flex flex-wrap gap-3">
            <a href="#features" className="rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-3 text-sm">Start saving now</a>
            <a href="/sign-in" className="rounded-md px-4 py-3 text-sm border" style={{ borderColor: 'var(--border)' }}>Sign in</a>
          </div>
          <div className="text-xs opacity-70">Your data is protected with modern security. No hidden fees.</div>
        </div>
        <div>
          <div className="card p-6 aspect-[4/3] rounded-2xl grid place-items-center">
            <div className="text-center">
              <div className="text-sm opacity-70 mb-2">Preview</div>
              <div className="text-2xl font-semibold">Squad progress • 68%</div>
              <div className="mt-4 h-2 w-72 bg-black/10 dark:bg-white/10 rounded">
                <div className="h-2 bg-[color:var(--accent)] rounded" style={{ width: '68%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
