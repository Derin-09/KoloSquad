export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full h-3 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-black dark:bg-white"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
