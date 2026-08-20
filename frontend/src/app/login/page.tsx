"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  Loader2,
  ShieldCheck,
  Settings2,
  Upload,
  ClipboardList,
} from "lucide-react";
import { DEMO_ACCOUNTS, getHomePathForRole } from "@/lib/role-routes";
import type { ApiUser } from "@/types/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/auth-provider";
import { ApiError } from "@/lib/api-client";
import { AuthProvider } from "@/contexts/auth-provider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portal = searchParams.get("portal");
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("donor@medibridge.health");
  const [password, setPassword] = useState("password123");
  const [registerRole, setRegisterRole] = useState<"donor" | "receiver">("donor");

  useEffect(() => {
    if (portal === "pharmacist") {
      setMode("login");
      setEmail("pharmacist@medibridge.health");
    } else if (portal === "admin") {
      setMode("login");
      setEmail("admin@medibridge.health");
    }
  }, [portal]);

  const finishLogin = (loggedIn: ApiUser) => {
    const dest = getHomePathForRole(loggedIn.role);
    if (loggedIn.role === "pharmacist") {
      toast.success("Pharmacist portal", {
        description: "Review medicines and tap Approve or Reject",
      });
    } else {
      toast.success("Welcome back!");
    }
    router.push(dest);
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      const user = await login(demoEmail, demoPassword);
      finishLogin(user);
    } catch (err) {
      let msg = "Login failed";
      if (err instanceof ApiError) msg = err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const user = await login(email, password);
        finishLogin(user);
      } else {
        const user = await register(fullName, email, password, registerRole);
        toast.success("Account created!", {
          description:
            registerRole === "receiver"
              ? "You can request medicines from the Requests page."
              : "You can upload medicines from the Upload page.",
        });
        router.push(getHomePathForRole(user.role));
      }
    } catch (err) {
      let msg = "Authentication failed";
      if (err instanceof ApiError) {
        msg = err.errors?.length
          ? err.errors.map((e) => e.msg).join(". ")
          : err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 to-green-600 p-12 flex-col justify-between overflow-hidden">
        <Logo showText className="text-white [&_span]:text-white [&_.gradient-text]:text-white" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Smart Medicine
            <br />
            Redistribution
          </h2>
          <p className="text-white/80 text-lg max-w-md leading-relaxed">
            Connected to the MediBridge API with free local OCR on upload (no billing).
          </p>
        </motion.div>
        <p className="text-sm text-white/70">
          Pharmacist login → Approve / Reject medicines after donor upload
        </p>
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
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h1>
            </div>

            {mode === "login" && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((demo) => {
                    const Icon =
                      demo.key === "pharmacist"
                        ? ShieldCheck
                        : demo.key === "admin"
                          ? Settings2
                          : demo.key === "donor"
                            ? Upload
                            : ClipboardList;
                    const borderClass =
                      demo.key === "pharmacist"
                        ? "border-green-600/50 bg-green-600/10"
                        : demo.key === "admin"
                          ? "border-blue-600/40 bg-blue-600/10"
                          : demo.key === "donor"
                            ? "border-blue-600/40 bg-blue-600/10"
                            : "border-amber-500/40 bg-amber-500/10";
                    return (
                      <button
                        key={demo.key}
                        type="button"
                        disabled={loading}
                        onClick={() => handleDemoLogin(demo.email, demo.password)}
                        className={`text-left rounded-xl border-2 p-3 transition-colors hover:opacity-90 ${borderClass}`}
                      >
                        <Icon className="h-4 w-4 mb-1" />
                        <p className="text-sm font-semibold">{demo.role}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
              <button
                type="button"
                className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                  mode === "login" ? "bg-background shadow font-medium" : ""
                }`}
                onClick={() => setMode("login")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                  mode === "register" ? "bg-background shadow font-medium" : ""
                }`}
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && (
                <div className="space-y-2">
                  <Label>I want to register as</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegisterRole("donor")}
                      className={`rounded-xl border-2 p-3 text-left text-sm transition-colors ${
                        registerRole === "donor"
                          ? "border-blue-600 bg-blue-600/10 font-semibold"
                          : "border-border"
                      }`}
                    >
                      <Upload className="h-4 w-4 mb-1 text-blue-600" />
                      Donor
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterRole("receiver")}
                      className={`rounded-xl border-2 p-3 text-left text-sm transition-colors ${
                        registerRole === "receiver"
                          ? "border-amber-500 bg-amber-500/10 font-semibold"
                          : "border-border"
                      }`}
                    >
                      <ClipboardList className="h-4 w-4 mb-1 text-amber-600" />
                      Receiver
                    </button>
                  </div>
                </div>
              )}
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      className="pl-10"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </div>
              {mode === "login" && (
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" defaultChecked />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    Remember me
                  </Label>
                </div>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthProvider>
  );
}
