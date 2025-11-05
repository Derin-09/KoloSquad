import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import Security from "@/components/marketing/Security";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <Security />
      <section id="faqs" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-semibold">Got questions?</h3>
          <p className="opacity-80 mt-2">We&apos;re building fast. Reach out and we&apos;ll help you get started.</p>
          <a href="/sign-up" className="inline-block mt-6 rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-3 text-sm">Create free account</a>
        </div>
      </section>
    </>
  );
}
