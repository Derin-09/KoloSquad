"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import NewSquadPage from "./new/page";
import JoinSquadPage from "./join/page";
import Link from "next/link";
// import { Squad } from "@/types/types";

interface Squad {
  id: string
  name: string
}

export default function SquadsPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  useEffect(() => {
    async function fetchSquads() {
      const { data, error } = await supabase.from("squads").select("id, name");
      if (error) console.error("Error fetching squads:", error);
      else setSquads(data || []);
    }

    fetchSquads();
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* Section 1: Your Squads List */}
      <div>
        <h1 className="text-2xl font-semibold mb-4">Your Squads</h1>

        {squads.length === 0 ? (
          <p className="text-muted-foreground">
            You&apos;re not in any squads yet.
          </p>
        ) : (
          <div className="space-y-3">
            {squads.map((squad) => (
              <Link
                key={squad.id}
                href={`/squads/${squad.id}`}
                className="block border border-border rounded-xl p-4 hover:bg-muted transition"
              >
                <p className="font-medium capitalize">{squad.name}</p>
                <p className="text-sm text-muted-foreground">
                  View contributions →
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Create/Join Tabs */}
      <div className="mt-10">
        <div className="flex gap-6 border-b border-border relative">
          {["create", "join"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "create" | "join")}
              className={`pb-2 text-lg font-medium transition-colors ${
                activeTab === tab
                  ? "text-purple-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "create" ? "Create Squad" : "Join Squad"}
            </button>
          ))}

          {/* Purple underline animation */}
          <motion.div
            className="absolute bottom-0 h-[2px] w-[50px] bg-purple-500"
            layoutId="underline"
            initial={false}
            animate={{
              left: activeTab === "create" ? "0%" : "13%",
              width: "10%",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>

        {/* Content area */}
        <div className="relative overflow-hidden min-h-[250px] mt-6">
          <AnimatePresence mode="wait">
            {activeTab === "create" ? (
              <motion.div
                key="create"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 30, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <NewSquadPage/>
              </motion.div>
            ) : (
              <motion.div
                key="join"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <JoinSquadPage/>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}






