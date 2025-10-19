// supabase/functions/sendReminders/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.cron("daily-reminders", "0 8 * * *", async () => {
  const today = new Date().toISOString().split("T")[0];
  const { data: duePlans } = await supabase
    .from("contribution_plans")
    .select("*")
    .eq("next_due_date", today)
    .eq("active", true);

  for (const plan of duePlans || []) {
    // send email / push notification
    console.log(`Remind user ${plan.user_id} to contribute ₦${plan.amount}`);
    
    // advance next_due_date
    const next = new Date(plan.next_due_date);
    if (plan.frequency === "weekly") next.setDate(next.getDate() + 7);
    else if (plan.frequency === "bi-weekly") next.setDate(next.getDate() + 14);
    else if (plan.frequency === "monthly") next.setMonth(next.getMonth() + 1);

    await supabase
      .from("contribution_plans")
      .update({ next_due_date: next.toISOString().split("T")[0] })
      .eq("id", plan.id);
  }
});
