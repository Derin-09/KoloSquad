"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Bell, CreditCard, Lock, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [squadNick, setSquadNick] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteChecked, setDeleteChecked] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user) return;
        setEmail(user.email || "");
        setFullName((user.user_metadata as any)?.full_name || "");
        setSquadNick((user.user_metadata as any)?.squad_nickname || "");
      } catch {
        // ignore
      }
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
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          squad_nickname: squadNick,
          ...(avatar_url ? { avatar_url } : {}),
        },
      });

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: fullName,
            avatar_url: avatar_url ?? null,
          })
          .eq("id", user.id);

        if (profileError) {
          console.log("Profile update failed:", profileError);
        }
      }

      if (error) throw error;
      setMsg("Profile updated successfully.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Update failed";
      setErr(message);
    } finally {
      setSaving(false);
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (deletePhrase.trim() !== "DELETE") {
      setDeleteError("Please type DELETE exactly to confirm.");
      return;
    }
    if (!deleteChecked) {
      setDeleteError("Please acknowledge the permanent consequences.");
      return;
    }

    setDeleting(true);
    try {
      // Placeholder for actual account deletion workflow.
      // This UI confirms the action and would be wired to backend deletion.
      setDeleteSuccess(
        "We received your account deletion request. All squad history and saved progress will be removed once the deletion is processed."
      );
      setDeleteError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to process deletion.";
      setDeleteError(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 text-white">
      <div className="rounded-4xl border border-[#232b35] bg-[#09101b]/95 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.32)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[#2c3b53] bg-[#0d1724] text-4xl font-semibold text-[#9ed7ec]">
              AS
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#7fa7c4]">Profile</p>
              <h1 className="mt-3 text-3xl font-semibold">Alexander Sterling</h1>
              <p className="mt-2 text-sm text-[#9fb4d4]">alex.sterling@kolosquad.io</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#122338] px-3 py-1 text-xs uppercase tracking-[0.24em] text-[#8eceff]">Squad Lead</span>
                <span className="rounded-full bg-[#122338] px-3 py-1 text-xs uppercase tracking-[0.24em] text-[#f8d47a]">Premium Member</span>
              </div>
            </div>
          </div>
          <Button className="rounded-full bg-[#9ed7ec] text-[#0f2b33] hover:bg-[#7ac5cc]" size="lg">
            Edit Details
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#1f2b37] bg-[#09101a]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[#82c9f0]">Security</p>
                <h2 className="mt-3 text-xl font-semibold">Stay protected</h2>
              </div>
              <Shield className="h-6 w-6 text-[#7fc4f0]" />
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl border border-[#18243a] bg-[#0b1724] p-4">
                <p className="text-sm font-semibold text-white">Biometrics</p>
                <p className="mt-1 text-sm text-[#8fa8c2]">FaceID and TouchID active</p>
              </div>
              <div className="rounded-3xl border border-[#18243a] bg-[#0b1724] p-4">
                <p className="text-sm font-semibold text-white">Change PIN</p>
                <p className="mt-1 text-sm text-[#8fa8c2]">Last updated 3 months ago</p>
              </div>
              <div className="rounded-3xl border border-[#18243a] bg-[#0b1724] p-4">
                <p className="text-sm font-semibold text-white">Two-Factor Auth</p>
                <p className="mt-1 text-sm text-[#8fa8c2]">Authenticator app enabled</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#1f2b37] bg-[#09101a]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[#82c9f0]">Notifications</p>
                <h2 className="mt-3 text-xl font-semibold">Alerts & preferences</h2>
              </div>
              <Bell className="h-6 w-6 text-[#7fc4f0]" />
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl border border-[#18243a] bg-[#0b1724] p-4">
                <p className="text-sm font-semibold text-white">Savings Milestones</p>
                <p className="mt-1 text-sm text-[#8fa8c2]">When you reach a squad goal</p>
              </div>
              <div className="rounded-3xl border border-[#18243a] bg-[#0b1724] p-4">
                <p className="text-sm font-semibold text-white">Squad Activity</p>
                <p className="mt-1 text-sm text-[#8fa8c2]">New deposits and chats</p>
              </div>
              <div className="rounded-3xl border border-[#18243a] bg-[#0b1724] p-4">
                <p className="text-sm font-semibold text-white">Email Newsletter</p>
                <p className="mt-1 text-sm text-[#8fa8c2]">Monthly growth summaries</p>
              </div>
            </div>
          </section>
        </div>

        <section className="space-y-6">
          <div className="rounded-3xl border border-[#1f2b37] bg-[#09101a]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[#82c9f0]">Linked Accounts</p>
                <h2 className="mt-3 text-xl font-semibold">Bank connections</h2>
              </div>
              <CreditCard className="h-6 w-6 text-[#7fc4f0]" />
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl border border-[#18243a] bg-[#0b1724] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#8fa8c2]">Chase Sapphire</p>
                    <p className="mt-1 text-sm text-[#dbe8f3]">Primary • **** 4492</p>
                  </div>
                  <span className="rounded-full bg-[#0f2135] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#7fc4f0]">Primary</span>
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full">Disconnect</Button>
              </div>
              <div className="rounded-3xl border border-[#18243a] bg-[#0b1724] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#8fa8c2]">Amex Gold</p>
                    <p className="mt-1 text-sm text-[#dbe8f3]">**** 8810</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full">Disconnect</Button>
              </div>
              <div className="rounded-3xl border border-dashed border-[#2e4159] bg-[#081017] p-8 text-center text-[#7d95b5]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#244663] bg-[#091922] mx-auto text-2xl">+</div>
                <p className="mt-4 text-sm font-semibold text-white">Add Bank Account</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#401b1f] bg-[#180d12]/90 p-6 shadow-[0_30px_80px_rgba(112,30,56,0.18)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#f6c8c8]">Danger Zone</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Delete your account</h2>
            <p className="mt-3 text-sm leading-6 text-[#d8c6c6]">
              Permanently remove your account, squad contributions, and history. This action cannot be undone.
            </p>
            <div className="mt-6 space-y-3 rounded-3xl border border-[#3f1f24] bg-[#120d12] p-4 text-sm text-[#e9c8c8]">
              <p>• You will lose access to all active squads and saved streaks.</p>
              <p>• Rewards, milestones, and leaderboard progress will be deleted.</p>
              <p>• If you only need a break, logging out is safer than deleting your account.</p>
            </div>
            <Button
              variant="destructive"
              className="mt-6 w-full"
              onClick={() => {
                setShowDeleteModal(true);
                setDeleteError(null);
                setDeleteSuccess(null);
                setDeleteChecked(false);
                setDeletePhrase("");
              }}
            >
              Delete Account
            </Button>
          </div>
        </section>
      </div>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-lg rounded-3xl border border-[#2d3950] bg-[#07101b] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Confirm Account Deletion</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-[#9bb2d2]">
              This is your last chance to stop before your account and squad history are deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4 rounded-3xl border border-[#2d3b4f] bg-[#0b1624] p-5 text-sm text-[#d4dce8]">
            <p className="font-semibold text-white">Before you proceed</p>
            <ul className="space-y-2 list-disc pl-5 text-[#abbcd4]">
              <li>All squad contributions and leaderboard progress are removed permanently.</li>
              <li>You will lose access to active squads, rewards, and premium benefits.</li>
              <li>If you only need a break, log out instead.</li>
            </ul>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-3 rounded-2xl border border-[#2d3b4f] bg-[#0b1624] px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={deleteChecked}
                onChange={(e) => setDeleteChecked(e.target.checked)}
                className="h-4 w-4 rounded border-[#4e6e98] bg-[#08121e] text-[#7ac2f1] focus:ring-[#7ac2f1]"
              />
              <span>I understand this action is permanent.</span>
            </label>

            <div className="rounded-2xl border border-[#2d3b4f] bg-[#0b1624] px-4 py-3 text-sm">
              <p className="text-[#9bb2d2]">Type <span className="font-semibold text-white">DELETE</span> to confirm:</p>
              <input
                value={deletePhrase}
                onChange={(e) => setDeletePhrase(e.target.value)}
                placeholder="DELETE"
                className="mt-3 w-full rounded-2xl border border-[#375273] bg-[#08101e] px-3 py-2 text-sm text-white focus:border-[#7ac2f1] outline-none"
              />
            </div>
          </div>

          {deleteError ? <p className="mt-4 text-sm text-red-300">{deleteError}</p> : null}
          {deleteSuccess ? <p className="mt-4 text-sm text-emerald-300">{deleteSuccess}</p> : null}

          <DialogFooter className="mt-6 gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!deleteChecked || deletePhrase.trim() !== "DELETE" || deleting}
              onClick={handleDeleteAccount}
            >
              {deleting ? "Deleting…" : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
