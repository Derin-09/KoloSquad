"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [squadNick, setSquadNick] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user) return;
        setEmail(user.email || "");
        setFullName((user.user_metadata)?.full_name || "");
        setSquadNick((user.user_metadata)?.squad_nickname || "");
      } catch {}
    })();
  }, []);

  async function saveProfile() {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      let avatar_url: string | undefined;
      if (avatar) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        if (cloudName && uploadPreset) {
          const form = new FormData();
          form.append("file", avatar);
          form.append("upload_preset", uploadPreset);
          const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
          const upJson = await upRes.json();
          if (upRes.ok && upJson?.secure_url) avatar_url = upJson.secure_url as string;
        }
      }
      const { error } = await supabase.auth.updateUser({ data: { full_name: fullName, squad_nickname: squadNick, ...(avatar_url ? { avatar_url } : {}) } });
      if (error) throw error;
      setMsg("Profile updated");
    } catch (e) {
        const err = e instanceof Error ? e.message :  "Update failed";
      setErr(err);
    } finally {
      setSaving(false);
    }
  }

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
            <input className=" w-[70%] md:w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors" placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input disabled className="w-[70%] md:w-full rounded-md border border-[color:var(--accent-input)] px-3 py-2 opacity-70" value={email} />
          </div>
          <div>
            <label className="block text-sm">Squad nickname</label>
            <input className="w-[70%] md:w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors" placeholder="e.g. Rent Gang" value={squadNick} onChange={(e) => setSquadNick(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">Avatar</label>
            <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={saveProfile} disabled={saving} className="rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-4 py-2 hover:brightness-95 text-sm">{saving ? "Saving..." : "Save changes"}</button>
          {msg && <span className="text-sm text-green-600">{msg}</span>}
          {err && <span className="text-sm text-red-600">{err}</span>}
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

      <div>
        <div className="pt-10 border-t border-white/10 flex justify-end">
          <Link href={'/sign-in'}
            // onClick={deleteSquad}
            className="px-5 py-2 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors hover:cursor-pointer"
          >
            Log Out
          </Link>
        </div>
      </div>
    </main>
  );
}
