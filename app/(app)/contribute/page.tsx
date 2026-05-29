"use client";

import { useEffect, useMemo, useState } from "react";
import { Bolt, ShieldCheck, UsersRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type SquadOption = {
  id: string;
  name: string;
};

type SquadMemberRow = {
  squad_id: string;
  squads: SquadOption | null;
};

export default function ContributePage() {
  const params = useSearchParams();

  const [amount, setAmount] = useState<number>(1000);
  const [email, setEmail] = useState("");
  const [squads, setSquads] = useState<SquadOption[]>([]);
  const [squadId, setSquadId] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appUrl = useMemo(
    () =>
      (typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000",
    []
  );

  useEffect(() => {
    async function fetchSetup() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setEmail(user.email || "");

      const { data, error: fetchError } = await supabase
        .from("squad_members")
        .select("squad_id, squads ( id, name )")
        .eq("user_id", user.id);

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      const uniqueSquads: SquadOption[] = [];
      const seen = new Set<string>();

      ((data || []) as SquadMemberRow[]).forEach((row) => {
        if (!row.squads?.id || seen.has(row.squads.id)) return;
        seen.add(row.squads.id);
        uniqueSquads.push(row.squads);
      });

      setSquads(uniqueSquads);

      const preselected = params.get("squadId") || "";
      if (preselected && uniqueSquads.some((s) => s.id === preselected)) {
        setSquadId(preselected);
      } else if (uniqueSquads[0]?.id) {
        setSquadId(uniqueSquads[0].id);
      }
    }

    void fetchSetup();
  }, [params]);

  async function startPayment() {
    setError(null);

    if (!email) {
      setError("Email is required before payment.");
      return;
    }

    if (!squadId) {
      setError("Select a squad to continue.");
      return;
    }

    setIsRedirecting(true);

    try {
      const reference = `KS_${Date.now()}`;
      const callbackParams = new URLSearchParams({ squadId });
      const callbackUrl = `${appUrl}/contribute/callback?${callbackParams.toString()}`;

      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          email,
          reference,
          callback_url: callbackUrl,
        }),
      });

      const json: {
        message?: string;
        data?: { authorization_url?: string };
      } = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Unable to initialize payment.");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from("contributions").insert({
        user_id: user?.id || null,
        squad_id: squadId,
        amount,
        status: "pending",
        reference,
      });

      if (!json.data?.authorization_url) {
        throw new Error("Missing payment authorization link.");
      }

      window.location.assign(json.data.authorization_url);
    } catch (paymentError) {
      const message =
        paymentError instanceof Error
          ? paymentError.message
          : "Payment initialization failed.";
      setError(message);
      setIsRedirecting(false);
    }
  }

  if (isRedirecting) {
    return (
      <main className="mx-auto flex min-h-[82vh] max-w-md flex-col items-center justify-center gap-6 rounded-[30px] border border-[#20242d] bg-[#06090f] p-6 text-white shadow-[0_0_90px_rgba(21,33,61,0.28)]">
        <div className="relative grid size-32 place-items-center rounded-[30px] border border-[#2a303d] bg-linear-to-br from-[#171b24] to-[#10131b]">
          <div className="size-20 rounded-full border-[6px] border-[#2e3542] border-t-[#abdde8] animate-spin" />
          <span className="absolute -bottom-2 -right-2 inline-flex size-9 items-center justify-center rounded-full bg-[#a9d7df] text-[#0f242d] shadow-lg">
            <Bolt className="size-5" />
          </span>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Redirecting to payment...</h1>
          <p className="text-sm leading-relaxed text-[#b6bfd1]">
            Don&apos;t close this window, we&apos;re getting things ready for your streak.
          </p>
        </div>

        <div className="w-full space-y-3">
          <div className="rounded-3xl border border-[#2a303d] bg-[#131821] px-4 py-3">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#d9e7f3]">
              <ShieldCheck className="size-4 text-[#9ed6e0]" />
              Secure Connection
            </p>
            <p className="mt-1 text-sm text-[#b6bfd1]">Encrypted end-to-end processing</p>
          </div>

          <div className="rounded-3xl border border-[#2a303d] bg-[#131821] px-4 py-3 opacity-90">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#d9e7f3]">
              <UsersRound className="size-4 text-[#9ed6e0]" />
              Squad Verification
            </p>
            <p className="mt-1 text-sm text-[#b6bfd1]">Syncing contribution with your team</p>
          </div>
        </div>

        <div className="rounded-full border border-[#33435b] bg-[#17202f] px-4 py-2 text-sm text-[#c9dff4] animate-pulse">
          Verifying transaction gateway
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Contribute</h1>

      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <div>
          <label className="block text-sm font-medium">Squad</label>
          <select
            value={squadId}
            onChange={(event) => setSquadId(event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring"
          >
            {squads.length === 0 ? (
              <option value="">No squad available</option>
            ) : (
              squads.map((squad) => (
                <option key={squad.id} value={squad.id}>
                  {squad.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Amount (NGN)</label>
          <input
            type="number"
            value={amount}
            min={100}
            onChange={(event) => setAmount(Number(event.target.value) || 0)}
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring"
          />
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="button"
          onClick={startPayment}
          disabled={!amount || !email || !squadId}
          className="h-11 w-full rounded-full bg-[#a9d7df] text-sm font-semibold text-[#10242b] transition hover:bg-[#96c6cf] disabled:opacity-60"
        >
          Pay with Paystack
        </button>
      </div>
    </main>
  );
}
