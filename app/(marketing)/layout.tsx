import type { ReactNode } from "react";
import MarketingNavbar from "@/components/marketing/Navbar";
import MarketingFooter from "@/components/marketing/Footer";
import { LayoutTransition } from "@/components/ui/PageTransition";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <MarketingNavbar />
      <LayoutTransition>
        <main className="flex-1">{children}</main>
      </LayoutTransition>
      <MarketingFooter />
    </div>
  );
}
