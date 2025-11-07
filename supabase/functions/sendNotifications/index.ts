// import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// const supabase = createClient(
//   Deno.env.get("SUPABASE_URL")!,
//   Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
// );

// serve(async (req) => {
//   try {
//     const { type, squad_id, actor_id, details } = await req.json();

//     // Get all squad members except the actor
//     const { data: members, error } = await supabase
//       .from("squad_members")
//       .select("user_id")
//       .eq("squad_id", squad_id)
//       .neq("user_id", actor_id);

//     if (error) throw error;

//     const notifications = members.map((m) => ({
//       squad_id,
//       user_id: m.user_id,
//       title:
//         type === "plan_edit"
//           ? "Contribution plan updated"
//           : type === "plan_create"
//           ? "New contribution plan"
//           : "New contribution received",
//       message:
//         type === "plan_edit"
//           ? `${details.actor_name} updated the contribution plan`
//           : type === "plan_create"
//           ? `${details.actor_name} created a new contribution plan`
//           : `${details.actor_name} just contributed ₦${details.amount}`,
//     }));

//     const { error: insertErr } = await supabase
//       .from("notifications")
//       .insert(notifications);

//     if (insertErr) throw insertErr;

//     return new Response(JSON.stringify({ success: true }), { status: 200 });
//   } catch (e) {
//     console.error(e);
//     return new Response(JSON.stringify({ error: e.message }), { status: 500 });
//   }
// });
