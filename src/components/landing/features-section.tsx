"use client";

import { motion } from "framer-motion";
import {
  ScanLine,
  QrCode,
  ShieldCheck,
  Brain,
  Building2,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: ScanLine,
    title: "OCR-based Expiry Detection",
    description: "AI scans medicine packaging to extract expiry dates automatically.",
  },
  {
    icon: QrCode,
    title: "QR Tracking",
    description: "End-to-end traceability from donation to patient distribution.",
  },
  {
    icon: ShieldCheck,
    title: "Pharmacist Verification",
    description: "Licensed pharmacists verify safety before redistribution.",
  },
  {
    icon: Brain,
    title: "Smart Matching System",
    description: "AI matches donated medicines with urgent patient requests.",
  },
  {
    icon: Building2,
    title: "NGO Distribution",
    description: "Seamless coordination with verified NGO partners nationwide.",
  },
  {
    icon: BarChart3,
    title: "Realtime Dashboard",
    description: "Live analytics on donations, waste reduction, and impact metrics.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/5 to-transparent" />
      <div className="container mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Powerful <span className="gradient-text">Features</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need for safe, smart medicine redistribution
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.03 }}
              className="glass-card p-6 group hover:border-sky-500/30 transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center mb-4 group-hover:from-sky-500 group-hover:to-teal-500 transition-all">
                <feature.icon className="h-6 w-6 text-sky-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
