"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  LayoutDashboard,
  Loader2,
  Share2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type PaymentStatus = "verifying" | "success" | "failed";

type ReceiptData = {
  amount: number;
  squadName: string;
};

type ContributionLookup = {
  amount?: number;
  squads?: { name?: string } | null;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export default function ContributionCallbackPage() {
  const router = useRouter();

  const [status, setStatus] = useState<PaymentStatus>("verifying");
  const [message, setMessage] = useState("Verifying payment...");
  const [reference, setReference] = useState("");
  const [receipt, setReceipt] = useState<ReceiptData>({
    amount: 0,
    squadName: "Your Squad",
  });

  const shareText = useMemo(
    () =>
      `I just deposited ${formatCurrency(receipt.amount)} into ${receipt.squadName} on KoloSquad.`,
    [receipt.amount, receipt.squadName]
  );

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const currentReference = search.get("reference") || "";

    setReference(currentReference);

    if (!currentReference) {
      setStatus("failed");
      setMessage("Missing transaction reference.");
      return;
    }

    async function verifyTransaction() {
      try {
        const res = await fetch(
          `/api/paystack/verify?reference=${encodeURIComponent(currentReference)}`
        );
        const json = await res.json();

        if (!res.ok || json.status !== "success") {
          setStatus("failed");
          setMessage(json.message || "Payment verification failed.");
          return;
        }

        const paidAmount = Number(json?.data?.amount || 0) / 100;

        const { data: row } = await supabase
          .from("contributions")
          .select("amount, squads(name)")
          .eq("reference", currentReference)
          .maybeSingle<ContributionLookup>();

        setReceipt({
          amount: Number(row?.amount || paidAmount),
          squadName: row?.squads?.name || "Alpha Squad",
        });

        setStatus("success");
        setMessage("Payment verified! Your contribution has been recorded.");
      } catch (verifyError) {
        setStatus("failed");
        setMessage(
          verifyError instanceof Error
            ? verifyError.message
            : "Verification error"
        );
      }
    }

    void verifyTransaction();
  }, []);

  async function onShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "KoloSquad Flex Card",
          text: shareText,
        });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setMessage("Flex card text copied. Paste to share.");
    } catch {
      setMessage("Could not open share sheet. Try again.");
    }
  }

  if (status === "verifying") {
    return (
      <main className="mx-auto flex min-h-[82vh] max-w-md flex-col items-center justify-center gap-6 rounded-[30px] border border-[#20242d] bg-[#06090f] p-6 text-white shadow-[0_0_90px_rgba(21,33,61,0.28)]">
        <div className="relative grid size-32 place-items-center rounded-[30px] border border-[#2a303d] bg-linear-to-br from-[#171b24] to-[#10131b]">
          <div className="size-20 rounded-full border-[6px] border-[#2e3542] border-t-[#abdde8] animate-spin" />
          <span className="absolute -bottom-2 -right-2 inline-flex size-9 items-center justify-center rounded-full bg-[#a9d7df] text-[#0f242d] shadow-lg">
            <Loader2 className="size-5" />
          </span>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Verifying payment...</h1>
          <p className="text-sm leading-relaxed text-[#b6bfd1]">
            Don&apos;t close this window, we&apos;re confirming your transaction.
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

  if (status === "failed") {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 rounded-[28px] border border-[#2a1d20] bg-[#090b10] p-6 text-white">
        <CheckCircle2 className="size-12 text-red-400" />
        <h1 className="text-2xl font-semibold">Payment Failed</h1>
        <p className="text-center text-sm text-[#c4cad8]">{message}</p>
        {reference ? (
          <p className="text-xs text-[#8f98ad]">Reference: {reference}</p>
        ) : null}
        <button
          onClick={() => router.replace("/contribute")}
          className="mt-2 h-11 rounded-full bg-[#a9d7df] px-6 text-sm font-semibold text-[#10242b] hover:bg-[#96c6cf]"
        >
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[82vh] max-w-md flex-col items-center justify-center gap-4 rounded-[30px] border border-[#20242d] bg-[#06090f] p-6 text-white shadow-[0_0_90px_rgba(21,33,61,0.28)]">
      <div className="-mb-6 inline-flex size-14 items-center justify-center rounded-full bg-[#d9c79b] text-[#111827] ring-6 ring-[#06090f]">
        <Check className="size-7" />
      </div>

      <section className="w-full rounded-3xl border border-[#2a303d] bg-linear-to-br from-[#1a1d24] via-[#151922] to-[#12161d] p-5 pt-8 text-center">
        <h1 className="text-3xl font-semibold text-[#f2f5fd]">Payment Successful</h1>
        <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[#98a2ba]">
          KoloSquad savings deposit
        </p>

        <div className="mt-4 grid grid-cols-2 rounded-2xl bg-[#202733] p-3 text-left">
          <div>
            <p className="text-[11px] text-[#9ca7bf]">Amount Saved</p>
            <p className="text-3xl font-semibold text-[#b4e2ee]">{formatCurrency(receipt.amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#9ca7bf]">To Squad</p>
            <p className="text-2xl font-semibold text-[#f3f5fb]">{receipt.squadName}</p>
          </div>
        </div>
      </section>

      <section className="w-full rounded-3xl border border-[#2a303d] bg-linear-to-br from-[#1a1d24] via-[#151922] to-[#12161d] p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#e7ecf6]">12 Day Streak!</p>
          <span className="rounded-full bg-[#3a311f] px-2 py-1 text-[10px] font-semibold text-[#f1c66d]">
            Level 4
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#2a3140]">
          <div className="h-full w-4/5 rounded-full bg-[#d9c79b]" />
        </div>
        <p className="mt-2 text-[11px] text-[#98a2ba]">
          Only 3 more days to unlock the Diamond Vault Badge
        </p>
      </section>

      <section className="relative h-32 w-full overflow-hidden rounded-3xl border border-[#2a303d] bg-linear-to-br from-[#031625] via-[#082133] to-[#0f2f45]">
        <div className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial from-[#f8d89d] via-[#d7a861] to-transparent blur-sm" />
        <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-[#f8d89d]/70" />
        <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 -rotate-45 border-2 border-[#f8d89d]/40" />
      </section>

      <button
        onClick={onShare}
        className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#d9c79b] text-base font-semibold text-[#141a24] hover:bg-[#c8b88d]"
      >
        <Share2 className="size-4" />
        Share Flex Card
      </button>

      <button
        onClick={() => router.replace("/dashboard")}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#343d4f] bg-[#1a1f29] text-base font-semibold text-[#e6ebf5] hover:bg-[#212736]"
      >
        <LayoutDashboard className="size-4" />
        Back to Dashboard
      </button>

      <p className="text-center text-xs text-[#8f98ad]">{message}</p>
    </main>
  );
}
