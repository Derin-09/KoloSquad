export default function SettingsPage() {
  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Settings</h1>
          <p className="text-sm opacity-70">Manage your profile and preferences.</p>
        </div>
      </header>

      <section className="card p-4 space-y-4">
        <h2 className="text-sm font-medium">Profile</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Full name</label>
            <input className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input disabled className="w-full rounded-md border border-[color:var(--accent-input)] px-3 py-2 opacity-70" value="user@example.com" />
          </div>
        </div>
        <div>
          <button className="rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-4 py-2 hover:brightness-95 text-sm">Save changes</button>
        </div>
      </section>

      <section className="card p-4 space-y-4">
        <h2 className="text-sm font-medium">Preferences</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Currency</label>
            <select className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors">
              <option>NGN</option>
              <option>USD</option>
              <option>GBP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Notifications</label>
            <select className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors">
              <option>All</option>
              <option>Important only</option>
              <option>Off</option>
            </select>
          </div>
        </div>
        <div>
          <button className="rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-4 py-2 hover:brightness-95 text-sm">Update preferences</button>
        </div>
      </section>
    </main>
  );
}
