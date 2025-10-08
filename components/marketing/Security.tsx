import React, { type ComponentType } from "react";
import { SiSupabase, SiVercel } from "react-icons/si";
import { SiStripe as SiPaystack } from "react-icons/si";

export default function Security() {
  const partners: { name: string; color: string; Icon: ComponentType<{ size?: number; className?: string }> }[] = [
    { name: "Stripe", color: "#59C1CC", Icon: SiPaystack },
    { name: "Supabase", color: "#3ECF8E", Icon: SiSupabase },
    { name: "Vercel", color: "#000000", Icon: SiVercel },
  ];

  return (
    <section id="security" className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-center">
        <div className="card p-6 rounded-2xl">
          <h3 className="text-xl font-semibold">Your security is our priority</h3>
          <p className="opacity-80 mt-2 text-sm">KoloSquad uses industry‑standard encryption and secure payment partners. Funds are locked until payout conditions are met.</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• 256‑bit TLS encryption</li>
            <li>• Escrow‑style protection until goal is reached</li>
            <li>• Activity logs and email notifications</li>
          </ul>
        </div>
        <div className="card p-6 rounded-2xl">
          <h4 className="font-medium">Trusted partners</h4>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            {partners.map((p) => (
              <div key={p.name} className="h-12 rounded-md bg-[color:var(--muted)] flex items-center justify-center gap-2 px-2">
                <p.Icon size={18} className="opacity-90" />
                <span style={{ color: p.color }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
