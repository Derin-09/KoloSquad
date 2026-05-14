export function Donut({ value, total, size = 150, label }: { value: number; total: number; size?: number; label?: string }) {
  const pct = Math.round((value / Math.max(1, total)) * 100);
  const stroke = `conic-gradient(var(--success) ${pct}%, rgba(0,0,0,0.08) 0)`;
  return (
    <div className="flex items-center gap-4 px-4">
      <div
        style={{ width: size, height: size, backgroundImage: stroke, borderRadius: "50%", padding: 10 }}
        className="grid place-items-center"
      >
        <div className="rounded-full bg-[color:var(--surface)] w-full h-full grid place-items-center">
          <div >
            <p className="text-xl font-semibold">₦{value.toLocaleString()}</p>
            <p className="text-sm">{pct}%</p>
            </div>
        </div>
      </div>
      {/* {label && (
        <div>
          <div className="text-sm opacity-70">{label}</div>
          <div className="text-xl font-semibold">{value} / {total}</div>
        </div>
      )} */}
    </div>
  );
}
