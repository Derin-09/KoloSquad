import { Card } from "@/components/ui/Card";

export default function Features() {
  return (
    <section id="features" className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center">Many ways to build your savings</h2>
        <p className="text-center opacity-80 mt-2">Choose a plan that fits your squad and timeline.</p>
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card>
            <div className="text-sm opacity-70">Automated Savings</div>
            <div className="text-lg font-semibold mt-1">Set it and forget it</div>
            <p className="text-sm opacity-80 mt-2">Auto‑debit contributions on schedule for stress‑free savings.</p>
          </Card>
          <Card>
            <div className="text-sm opacity-70">Goal‑oriented Savings</div>
            <div className="text-lg font-semibold mt-1">Hit targets faster</div>
            <p className="text-sm opacity-80 mt-2">Track squad progress with milestones and a clear progress bar.</p>
          </Card>
          <Card>
            <div className="text-sm opacity-70">Group Savings</div>
            <div className="text-lg font-semibold mt-1">Save together</div>
            <p className="text-sm opacity-80 mt-2">Invite friends with a code and contribute securely to the pot.</p>
          </Card>
        </div>
      </div>
    </section>
  );
}
