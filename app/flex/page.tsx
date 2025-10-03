"use client";

import { useRef } from "react";
import { toPng } from "html-to-image";

export default function FlexCardPage() {
  const ref = useRef<HTMLDivElement>(null);

  const exportPng = async () => {
    if (!ref.current) return;
    const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `kolo-flex-card.png`;
    a.click();
  };

  return (
    <main className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Flex Card</h1>
      <p className="text-sm opacity-80">Share your squad milestone as an image.</p>

      <div
        ref={ref}
        className="rounded-2xl border border-black/10 dark:border-white/15 p-6 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-black"
      >
        <div className="text-sm opacity-70">KoloSquad</div>
        <h2 className="text-xl font-semibold mt-2">Rent Gang hit 50% of goal!</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-black/5 dark:bg-white/10 p-3">
            <div className="opacity-70">Saved</div>
            <div className="font-semibold">₦25,000</div>
          </div>
          <div className="rounded-md bg-black/5 dark:bg-white/10 p-3">
            <div className="opacity-70">Target</div>
            <div className="font-semibold">₦50,000</div>
          </div>
          <div className="rounded-md bg-black/5 dark:bg-white/10 p-3">
            <div className="opacity-70">Members</div>
            <div className="font-semibold">5</div>
          </div>
          <div className="rounded-md bg-black/5 dark:bg-white/10 p-3">
            <div className="opacity-70">Badge</div>
            <div className="font-semibold">First Contribution 🥇</div>
          </div>
        </div>
        <div className="mt-6 text-xs opacity-60">Save together. Flex together.</div>
      </div>

      <button
        onClick={exportPng}
        className="rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2"
      >
        Export as PNG
      </button>
    </main>
  );
}
