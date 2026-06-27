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
        .select(`squad_id, squads ( id, name )`)
        .eq("user_id", user.id)
        .returns<SquadMemberRow[]>();

      //  const { data, error: fetchError } = await supabase
      //         .from("squads")
      //         .select("name, id")
      //         .eq("created_by", user.id)
      //         .single()

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      const uniqueSquads: SquadOption[] = [];
      const seen = new Set<string>();

      ((data) as SquadMemberRow[]).forEach((row) => {
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
      <main className="mx-auto flex min-h-[82vh] max-w-md flex-col items-center justify-center gap-6 rounded-[30px] border border-[#20242d] bg-[#06090f] p-6  shadow-[0_0_90px_rgba(21,33,61,0.28)]">
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
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <h1 className="text-3xl font-semibold ">Contribute</h1>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Review your commitment and confirm your entry into the financial circle.
      </p>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="space-y-6 rounded-[28px] border border-accent/20 bg-[#1d1333]/20 p-6">
          <div className="rounded-3xl borer border-[#18304b] bg-[#1d1333]/40 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-accent">Alpha Growth Circle</p>
                <h2 className="mt-2 text-2xl font-semibold ">Active Squad • 8 members</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-accent/60 px-4 py-3 text-sm text-[#cad8ed] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                  <p className="text-[0.72rem] uppercase text-[#1d1333]">Weekly Contribution</p>
                  <p className="mt-2 text-lg font-semibold ">$250.00</p>
                </div>
                <div className="rounded-3xl bg-accent/60 px-4 py-3 text-sm text-[#cad8ed] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                  <p className="text-[0.72rem] uppercase text-[#1d1333]">Next Payout Date</p>
                  <p className="mt-2 text-lg font-semibold ">Oct 14, 2023</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl bg-[#1d1333]/40 p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold ">Squad Benefits</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-accent">
                <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/20 text-accent">
                  <Bolt className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold ">Guaranteed Rotational Payout</p>
                  <p className="mt-1 text-sm text-muted-foreground">Receive a lump sum of $2,000 when it’s your turn in the cycle.</p>
                </div>
              </li>
              <li className="flex gap-3 text-sm text-[#c4d1e8]">
                <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/20 text-accent">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold ">Default Protection</p>
                  <p className="mt-1 text-sm text-muted-foreground">Squad members are vetted for consistency and financial discipline.</p>
                </div>
              </li>
              <li className="flex gap-3 text-sm text-[#c4d1e8]">
                <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/20 text-accent">
                  <UsersRound className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold ">Credit Score Impact</p>
                  <p className="mt-1 text-sm text-muted-foreground">Consistent contributions are reported to boost your financial profile.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-[28px] flex h-52 flex-col justify-end gap-3 borer border-[#21304a] bg-[#1d1333]/40 py-6 px-5">
            {/* <div className="relative  rounded-[22px] borde border-[#1c2f45] bg-[radial-gradient(circle_at_top_left,rgba(58,142,190,0.18),transparent_45%)] p-5 "> */}
            <div className="rounded-2xl bg-accent/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-accent">
              Established 2022
            </div>
            <p className="text-lg font-semibold">Grow with a community built for steady returns and financial focus.</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Trusted members, verified payouts, and thoughtful onboarding make this your next best step.
            </p>
            {/* </div> */}
          </div>
        </section>

        <section className="space-y-6 rounded-[28px] border border-accent/20 bg-[#1d1333]/20 p-6">
          <div className="space-y-4 rounded-3xl border border-accent/20 bg-[#1d1333]/40 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-accent">Payment Summary</p>
            <div className="space-y-3 text-sm text-[#b7c5db]">
              <div className="flex items-center justify-between">
                <span>First Deposit</span>
                <span className="font-semibold ">$250.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Platform Fee (1%)</span>
                <span className="text-accent">$2.50</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-3xl bg-[#1d1333]/80 px-4 py-4 text-sm font-semibold ">
              <span>Total Due</span>
              <span>$252.50</span>
            </div>
          </div>

          <div className="rounded-3xl border border-accent/20 bg-[#1d1333]/40 p-5">
            <div className="flex items-center justify-between text-sm text-[#c0d1e4]">
              <div>
                <p className="font-semibold ">Wallet Balance</p>
                <p className="text-xs text-accent">Available funds</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-2 text-xs text-[#b7d1e3]">
                <span className="block h-2.5 w-2.5 rounded-full bg-accent" />
                $1,420.00
              </div>
            </div>
          </div>

          {error ? <p className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</p> : null}

          <div className="space-y-4">
            <div className="rounded-3xl border border-accent/20 bg-[#1d1333]/40 p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#c8d7f0]">Choose Squad</label>
                  <select
                    value={squadId}
                    onChange={(event) => setSquadId(event.target.value)}
                    className="mt-2 h-11 w-full rounded-2xl border border-accent/20 bg-[#1d1333]/60 px-4 text-sm  outline-none transition focus:border-[#4c8dd9]"
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
                  <label className="block text-sm font-medium text-[#c8d7f0]">Amount (NGN)</label>
                  <input
                    type="number"
                    value={amount}
                    min={100}
                    onChange={(event) => setAmount(Number(event.target.value) || 0)}
                    className="mt-2 h-11 w-full rounded-2xl border border-accent/20 bg-[#1d1333]/60 px-4 text-sm  outline-none transition focus:border-[#4c8dd9]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#c8d7f0]">Email</label>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 h-11 w-full rounded-2xl border border-accent/20 bg-[#1d1333]/60 px-4 text-sm  outline-none transition focus:border-[#4c8dd9]"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={startPayment}
              disabled={!amount || !email || !squadId}
              className="inline-flex h-14 w-full items-center justify-center rounded-full bg-accent/80 text-sm font-semibold text-primary transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              Confirm & Pay First Deposit
            </button>
            <p className="text-center text-xs uppercase tracking-[0.2em] text-accent">
              By confirming, you agree to the Squad Membership Terms and recurring weekly deductions.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
