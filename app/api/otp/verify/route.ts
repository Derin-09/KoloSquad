import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

function hash(val: string) {
  return crypto.createHash("sha256").update(val).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) return NextResponse.json({ error: "phone and code required" }, { status: 400 });

    const cookie = req.cookies.get("ks_otp");
    if (!cookie) return NextResponse.json({ error: "no otp session" }, { status: 400 });

    let parsed: { h: string; s: string; e: number; p: string };
    try {
      parsed = JSON.parse(cookie.value);
    } catch {
      return NextResponse.json({ error: "invalid session" }, { status: 400 });
    }

    if (parsed.p !== phone) return NextResponse.json({ error: "phone mismatch" }, { status: 400 });
    if (Date.now() > parsed.e) return NextResponse.json({ error: "expired" }, { status: 400 });

    const computed = hash(code + ":" + parsed.s);
    if (computed !== parsed.h) return NextResponse.json({ error: "invalid code" }, { status: 400 });

    const res = NextResponse.json({ verified: true });
    // clear cookie after successful verification
    res.cookies.set("ks_otp", "", { path: "/", maxAge: 0 });
    return res;
  } catch {
    return NextResponse.json({ error: "verify failed" }, { status: 500 });
  }
}