import type { CSSProperties } from "react";

export function SimpleBars({
  data,
  labels,
  height = 160,
}: {
  data: number[];
  labels?: string[];
  height?: number;
}) {
  const max = Math.max(1, ...data);
  return (
    <div className="w-full" style={{ height }}>
      <div className="h-full flex items-end gap-8 px-4">
        {data.map((v, i) => {
          const h = (v / max) * (height - 24);
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-10 rounded-md bg-[color:var(--accent)]/70" style={{ height: h }} />
              {labels?.[i] && (
                <div className="text-[10px] opacity-70">{labels[i]}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
