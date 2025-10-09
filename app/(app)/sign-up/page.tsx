"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pfp, setPfp] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appUrl = useMemo(() =>
    (typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000",
  []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // Upload profile picture to Cloudinary (unsigned) if provided
      let avatar_url: string | undefined = undefined;
      if (pfp) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        if (!cloudName || !uploadPreset) {
          console.warn("Cloudinary env missing: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
        } else {
          const form = new FormData();
          form.append("file", pfp);
          form.append("upload_preset", uploadPreset);
          const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
          const upJson = await upRes.json();
          if (upRes.ok && upJson?.secure_url) {
            avatar_url = upJson.secure_url as string;
          } else {
            console.warn("Cloudinary upload failed", upJson);
          }
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, avatar_url },
          emailRedirectTo: appUrl + "/onboarding",
        },
      });
      if (error) throw error;
      router.replace("/onboarding");
    } catch (e: any) {
      setError(e?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">Join KoloSquad and start saving with your squad.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input
            className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email address</label>
          <input
            type="email"
            className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Confirm password</label>
          <input
            type="password"
            className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Profile picture (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setPfp(e.target.files?.[0] || null)} />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-md bg-black text-white dark:bg.white dark:text-black px-3 py-2 disabled:opacity-50">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </main>
  );
}