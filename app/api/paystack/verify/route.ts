import { NextResponse } from "next/server";

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

    // Optional: write to DB via service role webhook alternative (skip here)
    return NextResponse.json({ status: "success", data: json.data });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Verify error" }, { status: 500 });
  }
}
