import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const TERMII_ENDPOINT = "https://api.ng.termii.com/api/sms/send";

function genCode(len = 6) {
  const digits = "0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += digits[Math.floor(Math.random() * digits.length)];
  return out;
}

function hash(val: string) {
  return crypto.createHash("sha256").update(val).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    const API_KEY = process.env.TERMII_API_KEY;
    const SENDER_ID = process.env.TERMII_SENDER_ID;
    if (!API_KEY || !SENDER_ID) {
      return NextResponse.json({ error: "TERMII not configured on server" }, { status: 500 });
    }

    const code = genCode(6);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    const salt = crypto.randomBytes(8).toString("hex");
    const codeHash = hash(code + ":" + salt);

    const cookiePayload = JSON.stringify({ h: codeHash, s: salt, e: expiresAt, p: phone });
    const res = NextResponse.json({ ok: true });
    res.cookies.set("ks_otp", cookiePayload, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 5 * 60,
    });

    // Send SMS via Termii
    const body = {
      api_key: API_KEY,
      to: phone.replace(/^0(\d{10})$/, "+234$1"),
      from: SENDER_ID,
      sms: `Your KoloSquad code is ${code}. It expires in 5 minutes.`,
      type: "plain",
      channel: "generic",
    };

    await fetch(TERMII_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    return res;
  } catch (e) {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}