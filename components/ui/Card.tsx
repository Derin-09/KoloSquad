import { clsx } from "clsx";
import type { PropsWithChildren } from "react";

export function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx("card p-4 sm:p-5", className)}>{children}</div>;
}
