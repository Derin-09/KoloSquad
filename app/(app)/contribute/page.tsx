"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

export default function ContributePage() {
  const [amount, setAmount] = useState<number>(1000);
  const [email, setEmail] = useState<string>("");
  const [squads, setSquads] = useState<{ id: string; name: string }[]>([]);
  const [squadId, setSquadId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const appUrl = useMemo(() => (typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000", []);

  useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const em = auth?.user?.email || "";
        setEmail(em);
        const { data } = await supabase
          .from("squad_members")
          .select("squads:id(squads(id,name)), squad_id")
          .limit(50);
        const list: { id: string; name: string }[] = [] as any;
        (data || []).forEach((row: any) => {
          if (row?.squads?.id) list.push({ id: row.squads.id, name: row.squads.name });
          else if (row?.squad_id) list.push({ id: row.squad_id, name: row.squad_id });
        });
        setSquads(list);
        const pre = params.get("squadId");
        if (pre && list.some((s) => s.id === pre)) setSquadId(pre);
        else if (list[0]?.id) setSquadId(list[0].id);
      } catch {}
    })();
  }, [params]);

  async function startPayment() {
    setLoading(true);
    try {
      if (!email) throw new Error("Email required");
      const reference = `KS_${Date.now()}`;
      const callback_url = `${appUrl}/contribute/callback`;
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, email, reference, callback_url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Init failed");

      // Optimistically create a pending contribution (ignore schema errors)
      try {
        const { data: auth } = await supabase.auth.getUser();
        await supabase.from("contributions").insert({
          user_id: auth?.user?.id,
          squad_id: squadId || null,
          amount,
          status: "pending",
          reference,
        });
      } catch {}

      window.location.assign(json.data.authorization_url);
    } catch (e: any) {
      alert(e?.message || "Payment init error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Contribute</h1>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Squad</label>
          <select value={squadId} onChange={(e) => setSquadId(e.target.value)} className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors">
            {squads.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Amount (₦)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-[color:var(--accent-input)] focus:border-[color:var(--accent-input-focus)] outline-none px-3 py-2 transition-colors" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={startPayment} disabled={loading || !amount || !email} className="flex-1 rounded-md bg-[color:var(--accent-button)] text-[color:var(--accent-foreground)] px-3 py-2 disabled:opacity-50">
            {loading ? "Redirecting..." : "Pay with Paystack"}
          </button>
          <a
            className="rounded-md border px-3 py-2 text-sm"
            href={`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('KoloSquad contribution reminder')}&body=${encodeURIComponent('Hi, this is your reminder to contribute ₦' + amount + ' to your squad.')}`}
          >Remind me</a>
        </div>
      </div>
    </main>
  );
}
