"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

const partners = [
  { name: "Vercel", logo: "/vercel.svg" },
  { name: "Next.js", logo: "/next.svg" },
];

export default function Partners() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-12 sm:py-16" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="text-center mb-6"
        >
          <h3 className="text-lg sm:text-xl font-semibold">Trusted Partners</h3>
          <p className="opacity-80 mt-2 text-sm">Built on modern web foundations. Loved by teams.</p>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center justify-items-center"
        >
          {partners.map((p) => (
            <motion.div key={p.name} variants={staggerItem} className="flex items-center gap-2">
              <Image src={p.logo} alt={p.name} width={28} height={28} />
              <span className="text-sm opacity-90">{p.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}