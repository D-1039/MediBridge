"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeartPulse, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Welcome back!", { description: "Redirecting to dashboard..." });
    setTimeout(() => router.push("/dashboard"), 800);
  };

  return (
    <div className="min-h-screen flex">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-sky-500 via-teal-500 to-emerald-500 p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <Logo showText className="text-white [&_span]:text-white [&_.gradient-text]:text-white" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Smart Medicine<br />Redistribution
          </h2>
          <p className="text-white/80 text-lg max-w-md leading-relaxed">
            Join thousands saving lives by redistributing unused medicines safely.
          </p>
        </motion.div>
        <div className="flex gap-8 text-white/90">
          {[
            { value: "1.2K+", label: "Medicines Saved" },
            { value: "340+", label: "Patients Helped" },
            { value: "80+", label: "NGOs" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          <div className="glass-card p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center mx-auto mb-4 lg:hidden">
                <HeartPulse className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Welcome Back</h1>
              <p className="text-muted-foreground mt-1">Sign in to your MediBridge account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    defaultValue="admin@medibridge.health"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    defaultValue="password"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" defaultChecked />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Link href="#" className="text-sm text-sky-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full" size="lg">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/dashboard/upload" className="text-sky-500 hover:underline font-medium">
                Start donating
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
