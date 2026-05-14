"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pfp, setPfp] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const signupUser = useAuthStore((state) => state.signupUser);

  const appUrl = useMemo(
    () =>
      (typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000",
    []
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // Cloudinary upload (unsigned) if provided
      let avatar_url: string | undefined = undefined;
      if (pfp) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        if (cloudName && uploadPreset) {
          const form = new FormData();
          form.append("file", pfp);
          form.append("upload_preset", uploadPreset);
          const upRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: form }
          );
          const upJson = await upRes.json();
          if (upRes.ok && upJson?.secure_url) {
            avatar_url = upJson.secure_url as string;
          }
        }
      }

      const result = await signupUser({
        email,
        password,
        fullName,
        avatarUrl: avatar_url,
        emailRedirectTo: appUrl + "/dashboard",
      });

      if (result.requiresEmailVerification) {
        setNotice(
          "We have sent a verification link to your email. Please verify to continue."
        );
        return;
      }

      window.location.href = "/onboarding";
    } catch (e) {
      const err = e instanceof Error ? e.message : "Sign up failed";
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Full name</label>
        <input
          className="w-full rounded-md border border-(--accent-input) focus:border-(--accent-input-focus) outline-none px-3 py-2 transition-colors"
          placeholder="Jane Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Email</label>
        <input
          className="w-full rounded-md border border-(--accent-input) focus:border-(--accent-input-focus) outline-none px-3 py-2 transition-colors"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Password</label>
        <input
          className="w-full rounded-md border border-(--accent-input) focus:border-(--accent-input-focus) outline-none px-3 py-2 transition-colors"
          type="password"
          placeholder="........"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Confirm password</label>
        <input
          className="w-full rounded-md border border-(--accent-input) focus:border-(--accent-input-focus) outline-none px-3 py-2 transition-colors"
          type="password"
          placeholder="........"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Profile picture (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPfp(e.target.files?.[0] || null)}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-(--accent-button) text-accent-foreground px-3 py-2 hover:brightness-95 transition-colors disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create account"}
      </button>
      {notice && <p className="text-sm text-green-600">{notice}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-sm">
        Already have an account? <a href="/sign-in" className="underline">Sign in</a>
      </p>
    </form>
  );
}
