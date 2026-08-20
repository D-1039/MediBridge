"use client";

import { motion } from "framer-motion";
import {
  Upload,
  Scan,
  ShieldCheck,
  QrCode,
  Heart,
} from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload Medicine", description: "Donors upload medicine details and images" },
  { icon: Scan, title: "AI Verification", description: "OCR extracts expiry and validates packaging" },
  { icon: ShieldCheck, title: "Pharmacist Approval", description: "Licensed pharmacist verifies safety" },
  { icon: QrCode, title: "QR Tracking", description: "Unique QR code for full traceability" },
  { icon: Heart, title: "Patient Distribution", description: "Matched to needy patients via NGOs" },
];

export function WorkflowSection() {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From donation to delivery — a seamless, verified workflow
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 -translate-y-1/2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4">
                  <step.icon className="h-8 w-8 text-white" />
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white dark:bg-slate-900 text-xs font-bold flex items-center justify-center border-2 border-blue-600">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
