"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NewSquadPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [target, setTarget] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSquad = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");

      // 🎯 Create unique invite code
      const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();

      // 🟣 1️⃣ Create the squad
      const { data: squad, error: squadError } = await supabase
        .from("squads")
        .insert({
          name,
          target_amount: target,
          invite_code: inviteCode,
          created_by: user.id,
        })
        .select()
        .single();

      if (squadError) throw squadError;

      // 🟢 2️⃣ Add creator as squad owner
      const { error: memberError } = await supabase.from("squad_members").insert({
        squad_id: squad.id,
        user_id: user.id,
        role: "owner",
      });

      if (memberError) throw memberError;

      // 🪙 3️⃣ Auto-create the squad’s first contribution plan
      const { error: planError } = await supabase.from("contribution_plans").insert({
        squad_id: squad.id,
        created_by: user.id,
        frequency: "weekly", // defaults
        amount: 1000,
        type: "pooled",
        start_date: new Date().toISOString().split("T")[0],
        next_due_date: new Date().toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0]
      });

      if (planError) throw planError;

      // 🚀 Redirect to squad page
      router.replace(`/squads/${squad.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create squad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Create Squad</h1>

      <label className="block text-sm font-medium">Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Rent Gang"
        className="w-full rounded-md border-2 border-[color:var(--accent-input)] 
                   focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
      />

      <label className="block text-sm font-medium">Target (₦)</label>
      <input
        type="number"
        value={target}
        onChange={(e) => setTarget(Number(e.target.value))}
        className="w-full rounded-md border-2 border-[color:var(--accent-input)] 
                   focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
      />

      <button
        onClick={createSquad}
        disabled={loading || !name || target <= 0}
        className="w-full rounded-md bg-[color:var(--accent-button)] 
                   text-[color:var(--accent-foreground)] px-3 py-2 hover:brightness-95 text-sm"
      >
        {loading ? "Creating..." : "Create"}
      </button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </main>
  );
}












// "use client";

// import { useState } from "react";
// import { supabase } from "@/lib/supabase/client";
// import { useRouter } from "next/navigation";
// import JoinSquadPage from "../join/page";

// export default function NewSquadPage() {
//   const router = useRouter();
//   const [name, setName] = useState("");
//   const [target, setTarget] = useState(10000);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);





//   const createSquad = async () => {
//   try {
//     setLoading(true);
//     setError(null);

//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) throw new Error("Sign in required");

//     // 1️⃣ Create the squad
//     const { data: squad, error: squadError } = await supabase
//       .from("squads")
//       .insert({
//         name: squadName,
//         target_amount: targetAmount,
//         created_by: user.id,
//       })
//       .select()
//       .single();

//     if (squadError) throw squadError;

//     // 2️⃣ Automatically create its first plan
//     const { error: planError } = await supabase.from("contribution_plans").insert({
//       squad_id: squad.id,
//       created_by: user.id,
//       frequency: "weekly",  // you can default these
//       amount: 1000,         // or allow user input
//       type: "pooled",
//       start_date: new Date().toISOString().split("T")[0],
//       next_due_date: new Date().toISOString().split("T")[0],
//     });

//     if (planError) throw planError;

//     router.replace(`/squads/${squad.id}`);
//   } catch (e) {
//     setError(e instanceof Error ? e.message : "Failed to create squad");
//   } finally {
//     setLoading(false);
//   }
// };




// //   const createSquad = async () => {
// //   setError(null);
// //   console.log(supabase)
// //   setLoading(true);
// //   try {
// //     const { data: { user }, error: userError } = await supabase.auth.getUser();
// //     console.log("Auth check:", { user, userError });
// //     if (!user) throw new Error("Sign in required");

// //     const invite = Math.random().toString(36).slice(2, 8).toUpperCase();
// //     const { data, error } = await supabase
// //       .from("squads")
// //       .insert({
// //         name,
// //         target_amount: target,
// //         invite_code: invite,
// //       })
// //       .select("*")
// //       .single();
// //     if (error) throw error;

  


// //     await supabase
// //       .from("squad_members")
// //       .insert({ squad_id: data.id, user_id: user.id, role: "owner" });

// //     router.replace("/dashboard");
// //   } catch (e) {
// //     setError(e instanceof Error ? e.message : "Failed to create squad");
// //   } finally {
// //     setLoading(false);
// //   }
// // };


//   return (
//     <main className="max-w-md mx-auto space-y-4">
//       <h1 className="text-2xl font-bold">Create Squad</h1>

//       <label className="block text-sm font-medium">Name</label>
//       <input
//         // className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2"

//         className="w-full rounded-md border-2 border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         placeholder="e.g. Rent Gang"
//       />

//       <label className="block text-sm font-medium">Target (₦)</label>
//       <input
//         type="number"
//         // className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2"

//         className="w-full rounded-md border-2 border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors"
//         value={target}
//         onChange={(e) => setTarget(Number(e.target.value))}
//       />

//       <button
//         onClick={createSquad}
//         disabled={loading || !name || target <= 0}
//         // className="w-full rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2 disabled:opacity-50"
//         className="w-full rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-3 py-2 hover:brightness-95 text-sm"
//       >
//         {loading ? "Creating..." : "Create"}
//       </button>

//       {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}


//       {/* <div className="pt-5">
//         <JoinSquadPage />
//       </div> */}
//     </main>
//   );
// }
