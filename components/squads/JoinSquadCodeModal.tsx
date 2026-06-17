"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useJoinSquadModalStore } from "@/stores/join-squad-modal-store";

type SquadLookupResult = {
  id: string;
  name?: string;
  invite_code?: string;
  target_amount?: number;
  amount_per_member?: number;
  member_count?: number;
  duration?: string;
  duration_number?: number;
  frequency?: string;
};

function normalizeCode(input: string) {
  return input.trim().toUpperCase();
}

export default function JoinSquadCodeModal() {
  const router = useRouter();
  const isOpen = useJoinSquadModalStore((state) => state.isOpen);
  const close = useJoinSquadModalStore((state) => state.close);

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => normalizeCode(code).length >= 4, [code]);

  async function fetchSquadByCode(normalizedCode: string) {
    const rpcResponse = await supabase
      .rpc("get_squad_by_code", { code: normalizedCode })
      .single<SquadLookupResult>();

    if (!rpcResponse.error && rpcResponse.data) {
      return rpcResponse.data;
    }

    const fallbackResponse = await supabase
      .from("squads")
      .select("id, name, invite_code, target_amount, amount_per_member, member_count, duration, duration_number, frequency")
      .eq("invite_code", normalizedCode)
      .single<SquadLookupResult>();

    if (fallbackResponse.error || !fallbackResponse.data) {
      throw new Error("Squad not found. Check your join code and try again.");
    }

    return fallbackResponse.data;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedCode = normalizeCode(code);
    if (normalizedCode.length < 4) {
      setError("Enter a valid join code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const squad = await fetchSquadByCode(normalizedCode);

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `join-squad-preview:${normalizedCode}`,
          JSON.stringify(squad)
        );
      }

      close();
      setCode("");
      router.push(
        `/squads/join?code=${encodeURIComponent(normalizedCode)}&squadId=${encodeURIComponent(squad.id)}`
      );
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to verify this code right now.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function onOpenChange(open: boolean) {
    if (!open) {
      close();
      setError(null);
      setCode("");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-surface text-foreground">
        <DialogHeader>
          <DialogTitle>Join a Squad</DialogTitle>
          <DialogDescription>
            Enter your squad code to verify the circle before continuing.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label htmlFor="join-code" className="text-sm font-medium">
              Squad Code
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="join-code"
                autoComplete="off"
                autoFocus
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="e.g. E5MGO4"
                className="h-11 w-full rounded-md border border-(--accent-input) bg-transparent pl-9 pr-3 text-sm uppercase tracking-widest outline-none transition focus:border-(--accent-input-focus)"
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Verifying squad...
              </span>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
