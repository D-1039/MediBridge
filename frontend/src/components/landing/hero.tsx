"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Pill, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 text-blue-600" />
              AI-Powered Healthcare Redistribution
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              Reduce Medicine Waste.{" "}
              <span className="gradient-text">Save Lives Smartly.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              AI-powered medicine redistribution platform connecting donors,
              NGOs, pharmacists, and needy patients.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/dashboard/upload">
                  Donate Medicines
                  <ArrowRight className="ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login?portal=pharmacist">Pharmacist Login</Link>
              </Button>
            </div>
            <div className="flex items-center gap-8 mt-12">
              {[
                { icon: Pill, label: "Smart OCR" },
                { icon: Heart, label: "Safe Match" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-10 w-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600/15 to-green-600/15 animate-float" />
              <div className="absolute inset-8 glass-card p-8 flex flex-col justify-center gap-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-600/10 border border-green-600/20">
                  <div className="h-12 w-12 rounded-xl bg-green-600 flex items-center justify-center">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Medicine Verified</p>
                    <p className="text-sm text-muted-foreground">Paracetamol 500mg • Exp: 2027</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-600/10 border border-blue-600/20">
                  <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                    QR
                  </div>
                  <div>
                    <p className="font-semibold">QR Tracking Active</p>
                    <p className="text-sm text-muted-foreground">Batch #MB-2847</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-600/10 border border-green-600/20">
                  <div className="h-12 w-12 rounded-xl bg-green-600 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Patient Matched</p>
                    <p className="text-sm text-muted-foreground">Hope NGO • Mumbai</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
