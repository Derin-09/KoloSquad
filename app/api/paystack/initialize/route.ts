import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, email, reference, callback_url } = body || {};
    if (!amount || !email) {
      return NextResponse.json({ message: "amount and email are required" }, { status: 400 });
    }
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return NextResponse.json({ message: "PAYSTACK_SECRET_KEY not configured" }, { status: 500 });

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ amount: Math.round(Number(amount) * 100), email, reference, callback_url }),
    });
    const json = await res.json();
    if (!res.ok || !json?.status) {
      return NextResponse.json({ message: json?.message || "Failed to initialize" }, { status: 400 });
    }
    return NextResponse.json({ status: "success", data: json.data });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Init error" }, { status: 500 });
  }
}
