"use client";
import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSquadDraft } from "@/app/(app)/squads/new/draft-storage";




export default function SquadLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const isStandalone = pathname === "/sign-in"
    || pathname === "/sign-up"
    || (pathname?.startsWith("/reset-password") ?? false)
    || (pathname?.startsWith("/onboarding") ?? false);

  const handleConfirmCancel = () => {
    clearSquadDraft();
    setShowCancelModal(false);
    router.push("/squads");
  };

  if (isStandalone) {
    return <main className=" p-3 md:p-6 lg:p-8">{children}</main>;
  }

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col">
      <div className="w-full flex justify-between items-center gap-2 pb-3">
        <ChevronLeft onClick={router.back}/>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Cancel squad creation"
          onClick={() => setShowCancelModal(true)}
        >
          <X size={18} />
        </Button>
      </div>
      <div className="flex flex-1 justify-center overflow-y-auto">
          {children}
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground">Cancel squad creation?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to cancel squad creation?
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCancelModal(false)}
              >
                No, continue editing
              </Button>
              <Button type="button" variant="destructive" onClick={handleConfirmCancel}>
                Yes, cancel and clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
