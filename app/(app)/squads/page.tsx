"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import NewSquadPage from "./new/page"
import JoinSquadPage from "./join/page"
import Link from "next/link"
import { User, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import {  useSquadStore } from "@/stores/squad-store"
import { useAuthStore } from "@/stores/auth-store"

export default function SquadsPage() {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create")
  const router = useRouter()
  const queryClient = useQueryClient()
  const squads = useSquadStore((state) => state.stats)
  const fetchSquad = useSquadStore((state) => state.fetchSquad)
  const user = useAuthStore((state) => state.user)


  const {
    isLoading,
    isError
  } = useSquadStore()
useEffect(() => {
    user && fetchSquad(user?.id);
  }, [fetchSquad, user?.id])
  const showLoading = isLoading && (!squads || squads.length === 0)
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this squad?")) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not signed in")

      const { data: squad } = await supabase
        .from("squads")
        .select("created_by")
        .eq("id", id)
        .single()

      if (!squad || squad.created_by !== user.id) {
        throw new Error("Only the owner can delete this squad")
      }

      const { error } = await supabase.from("squads").delete().eq("id", id)
      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ["user-squads"] })
      alert("Squad deleted successfully")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete squad")
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Section 1: Your Squads List */}
      <div>
        <h1 className="text-2xl font-semibold mb-4">Your Squads</h1>

        {showLoading ? (
          <p className="text-muted-foreground">Loading squads...</p>
        ) : isError ? (
          <p className="text-red-500">Could not load squads. Please refresh.</p>
        ) : squads && squads.length === 0 ? (
          <p className="text-muted-foreground">
            You&apos;re not in any squads yet. Create or join one to get started!
          </p>
        ) : (
          <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:space-y-0 text-[#1d1333]">
            {squads && squads.map((squad) => (
              <div
                key={squad.id}
                className="relative block bg-accent rounded-xl p-4 hover:bg-muted transition group"
              >
                  <div className="flex justify-between items-center">
                    <p className="font-medium capitalize text-[18px]">{squad.name}</p>
                    <div className="flex items-center gap-2">
                      <User size={15} />
                      <p>{squad.members?.length || 0}</p>
                    </div>
                  </div>
                  <div className="fle flex-col items-center justify-center">
                    
                <Link href={`/squads/${squad.id}`} className="block">
                  <p className="text-sm text-muted-foreground">View contributions →</p>
                  
                </Link>
                  
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/flex?name=${encodeURIComponent(
                          squad.name
                        )}&saved=${encodeURIComponent(
                          squad.balance || ''
                        )}&target=${encodeURIComponent(squad.target_amount || 0)}`}
                        className="underline hover:scale-105"
                      >
                        Flex card
                      </Link>
                      <div
                        // href={`/contribute?squadId=${s.id}`}
                        className="rounded-md bg-(--accent-button) text-accent-foreground px-2 py-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/contribute?squadId=${squad.id}`);
                        }}
                      >
                        Contribute
                      </div>
                    </div>
                    </div>

                <button
                  onClick={() => handleDelete(squad.id)}
                  className="absolute top-3 right-3 p-2 rounded-md bg-red-500/70 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                  title="Delete squad"
                >
                  <Trash2 size={16} />
                </button>
              </div>
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

          <motion.div
            className="absolute bottom-0 h-0.5 w-12.5 bg-purple-500"
            layoutId="underline"
            initial={false}
            animate={{
              left: activeTab === "create" ? "0%" : "13%",
              width: "10%",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>

        <div className="relative overflow-hidden min-h-62.5 mt-6">
          <AnimatePresence mode="wait">
            {activeTab === "create" ? (
              <motion.div
                key="create"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 30, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NewSquadPage />
              </motion.div>
            ) : (
              <motion.div
                key="join"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <JoinSquadPage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}











// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase/client";
// import { motion, AnimatePresence } from "framer-motion";
// import NewSquadPage from "./new/page";
// import JoinSquadPage from "./join/page";
// import Link from "next/link";
// import { User } from "lucide-react";
// // import { Squad } from "@/types/types";

// interface Squad {
//   id: string
//   name: string
// }

// export default function SquadsPage() {
//   const [squads, setSquads] = useState<Squad[]>([]);
//   const [squadId, setSquadId] = useState('')
//   const [squadMembers, setSquadMembers] = useState<number>();
//   const [activeTab, setActiveTab] = useState<"create" | "join">("create");

//   useEffect(() => {
//     async function fetchSquads() {
//       const { data, error } = await supabase.from("squads").select("id, name")
//       // .eq("id", squadId);
//       if (error) console.error("Error fetching squads:", error);
//       else {
//         setSquads(data || []);
//         setSquadId(data.)
//       }
//     }

//     async function fetchSquadMembers() {
//       const { data, error} = await supabase.from("squad_members")
//       .select('*')
//       .eq("squad_id", squads.id);
//       if (error) console.error("Error fetching squads:", error);
//       else setSquadMembers(data.length);
//     }

//     fetchSquads();
//     fetchSquadMembers()
//   }, []);

//   return (
//     <div className="p-6 space-y-8">
//       {/* Section 1: Your Squads List */}
//       <div>
//         <h1 className="text-2xl font-semibold mb-4">Your Squads</h1>

//         {squads.length === 0 ? (
//           <p className="text-muted-foreground">
//             You&apos;re not in any squads yet. Create or join one to get started!
//           </p>
//         ) : (
//           <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:space-y-0 text-[#1d1333]">
//             {squads.map((squad) => (
//               <Link
//                 key={squad.id}
//                 href={`/squads/${squad.id}`}
//                 className="block bg-accent rounded-xl p-4 hover:bg-muted transition"
//               >
//                 <div className="flex justify-between items-center">
//                 <p className="font-medium capitalize text-[18px]">{squad.name}</p>
//                 <div className="flex items-center gap-2">
//                   <User size={15}/>
//                   <p>{squadMembers}</p>
//                 </div>
//                 </div>
//                 <p className="text-sm text-muted-foreground">
//                   View contributions →
//                 </p>
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Section 2: Create/Join Tabs */}
//       <div className="mt-10">
//         <div className="flex gap-6 bor\der-b border-border relative">
//           {["create", "join"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab as "create" | "join")}
//               className={`pb-2 text-lg font-medium transition-colors ${
//                 activeTab === tab
//                   ? "text-purple-500"
//                   : "text-muted-foreground hover:text-foreground"
//               }`}
//             >
//               {tab === "create" ? "Create Squad" : "Join Squad"}
//             </button>
//           ))}

//           {/* Purple underline animation */}
//           <motion.div
//             className="absolute bottom-0 h-[2px] w-[50px] bg-purple-500"
//             layoutId="underline"
//             initial={false}
//             animate={{
//               left: activeTab === "create" ? "0%" : "13%",
//               width: "10%",
//             }}
//             transition={{ type: "spring", stiffness: 500, damping: 30 }}
//           />
//         </div>

//         {/* Content area */}
//         <div className="relative overflow-hidden min-h-[250px] mt-6">
//           <AnimatePresence mode="wait">
//             {activeTab === "create" ? (
//               <motion.div
//                 key="create"
//                 initial={{ x: -30, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 exit={{ x: 30, opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="space-y-4"
//               >
//                 <NewSquadPage/>
//               </motion.div>
//             ) : (
//               <motion.div
//                 key="join"
//                 initial={{ x: 30, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 exit={{ x: -30, opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="space-y-4"
//               >
//                 <JoinSquadPage/>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// }






