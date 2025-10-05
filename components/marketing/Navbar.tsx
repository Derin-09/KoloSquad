import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function MarketingNavbar() {
  return (
    <nav className="sticky top-0 z-20 bg-[color:var(--surface)]/90 backdrop-blur border-b" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold">KoloSquad</Link>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a className="opacity-80 hover:opacity-100" href="#features">Features</a>
          <a className="opacity-80 hover:opacity-100" href="#security">Security</a>
          <a className="opacity-80 hover:opacity-100" href="#faqs">FAQs</a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="icon" />
          <Link href="/sign-in" className="px-3 py-2 text-sm">Sign in</Link>
          <Link href="/sign-in" className="rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2 text-sm">Create free account</Link>
        </div>
      </div>
    </nav>
  );
}
