"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import JoinSquadPage from "./join/page";
import NewSquadPage from "./new/page";
// import NewSquadPage from "./new";
// import JoinSquadPage from "./join";

export default function SquadsPage() {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [squads, setSquads] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch squads and members when mounted
  useState(() => {
    (async () => {
      try {
        setLoading(true);
        const { data: squadData } = await supabase
          .from("squads")
          .select("id, name, target_amount, invite_code, created_at");

        const { data: memberData } = await supabase
          .from("squad_members")
          .select("id, user_id, squad_id, role, joined_at");

        setSquads(squadData || []);
        setMembers(memberData || []);
      } finally {
        setLoading(false);
      }
    })();
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Your Squads</h1>

      <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
        {/* LEFT SECTION */}
        <section className="space-y-6">
          <div className="rounded-2xl border border-[color:var(--accent-border)] p-4 backdrop-blur-sm bg-[color:var(--accent-bg)]/40">
            <h2 className="text-lg font-semibold mb-3">Squads Overview</h2>
            {loading ? (
              <p className="text-sm opacity-70">Loading squads...</p>
            ) : squads.length > 0 ? (
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full text-sm border-collapse">
                  <thead className="bg-[color:var(--accent-bg)]/60">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Target (₦)</th>
                      <th className="px-3 py-2 text-left font-medium">Invite</th>
                      <th className="px-3 py-2 text-left font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {squads.map((s) => (
                      <tr key={s.id} className="border-t border-[color:var(--accent-border)]">
                        <td className="px-3 py-2">{s.name}</td>
                        <td className="px-3 py-2">{Number(s.target_amount).toLocaleString()}</td>
                        <td className="px-3 py-2 font-mono text-[color:var(--accent)]">{s.invite_code}</td>
                        <td className="px-3 py-2 text-xs opacity-70">
                          {new Date(s.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm opacity-70">No squads yet. Create one!</p>
            )}
          </div>

          <div className="rounded-2xl border border-[color:var(--accent-border)] p-4 backdrop-blur-sm bg-[color:var(--accent-bg)]/40">
            <h2 className="text-lg font-semibold mb-3">Members</h2>
            {loading ? (
              <p className="text-sm opacity-70">Loading members...</p>
            ) : members.length > 0 ? (
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full text-sm border-collapse">
                  <thead className="bg-[color:var(--accent-bg)]/60">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">User ID</th>
                      <th className="px-3 py-2 text-left font-medium">Squad ID</th>
                      <th className="px-3 py-2 text-left font-medium">Role</th>
                      <th className="px-3 py-2 text-left font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="border-t border-[color:var(--accent-border)]">
                        <td className="px-3 py-2 truncate">{m.user_id}</td>
                        <td className="px-3 py-2 truncate">{m.squad_id}</td>
                        <td className="px-3 py-2 capitalize">{m.role}</td>
                        <td className="px-3 py-2 text-xs opacity-70">
                          {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm opacity-70">No members yet.</p>
            )}
          </div>
        </section>

        {/* RIGHT SECTION — Create or Join */}
        <section className="relative">
          <div className="flex mb-4 gap-2 justify-end">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeTab === "create"
                  ? "bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)]"
                  : "border border-[color:var(--accent-border)] opacity-70 hover:opacity-100"
              }`}
            >
              Create Squad
            </button>
            <button
              onClick={() => setActiveTab("join")}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeTab === "join"
                  ? "bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)]"
                  : "border border-[color:var(--accent-border)] opacity-70 hover:opacity-100"
              }`}
            >
              Join Squad
            </button>
          </div>

          <div className="relative min-h-[400px] overflow-hidden rounded-2xl border border-[color:var(--accent-border)] p-4 bg-[color:var(--accent-bg)]/40 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              {activeTab === "create" ? (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                >
                  <NewSquadPage />
                </motion.div>
              ) : (
                <motion.div
                  key="join"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                >
                  <JoinSquadPage />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </main>
  );
}
