"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/animated-counter";

const stats = [
  { value: 1200, suffix: "+", label: "Medicines Saved" },
  { value: 340, suffix: "+", label: "Patients Helped" },
  { value: 45, suffix: "%", label: "Waste Reduced" },
  { value: 80, suffix: "+", label: "NGOs Connected" },
];

export function StatsSection() {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-r from-blue-600 to-green-600 p-1"
        >
          <div className="rounded-[22px] bg-background/95 backdrop-blur p-8 md:p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-2">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
