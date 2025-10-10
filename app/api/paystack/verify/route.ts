import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");
    if (!reference) return NextResponse.json({ message: "reference required" }, { status: 400 });

    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return NextResponse.json({ message: "PAYSTACK_SECRET_KEY not configured" }, { status: 500 });

    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok || !json?.status || json?.data?.status !== "success") {
      return NextResponse.json({ message: json?.message || "Verification failed" }, { status: 400 });
    }

    // Persist contribution + award first badge (best-effort)
    try {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

      const paidAmount = (json?.data?.amount || 0) / 100;
      const ref = reference;

      // Update existing pending contribution
      const { data: updated, error: upErr } = await admin
        .from("contributions")
        .update({ status: "success", amount: paidAmount, paid_at: new Date().toISOString() })
        .eq("reference", ref)
        .select("id, user_id")
        .maybeSingle();

      let userId = updated?.user_id as string | undefined;

      if (!updated && upErr == null) {
        // If there was no row, optionally insert minimal row (user_id unknown)
        await admin.from("contributions").insert({ reference: ref, amount: paidAmount, status: "success" });
      }

      if (!userId) {
        // Try to look up by reference
        const { data: row } = await admin.from("contributions").select("user_id").eq("reference", ref).maybeSingle();
        userId = row?.user_id as string | undefined;
      }

      if (userId) {
        // Count successful contributions
        const { count } = await admin
          .from("contributions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "success");
        if ((count || 0) === 1) {
          // Award first contribution badge
          await admin.from("user_badges").insert({ user_id: userId, code: "first_contribution", awarded_at: new Date().toISOString() });
        }
      }
    } catch {}

    return NextResponse.json({ status: "success", data: json.data });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Verify error" }, { status: 500 });
  }
}
