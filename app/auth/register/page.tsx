"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCheck,
  CloudRain,
  FileDown,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the Terms & Conditions");
      return;
    }

    setLoading(true);

    try {
      const verificationEmail = email.trim().toLowerCase();
      const { data, error } = await authClient.signUp.email({
        email: verificationEmail,
        password,
        name,
        callbackURL: "/auth/verify-otp",
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        sessionStorage.setItem("verifyEmail", verificationEmail);
        sessionStorage.setItem("registrationRole", "staff");

        const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
          email: verificationEmail,
          type: "email-verification",
        });

        if (otpError) {
          toast.error(
            otpError.message ||
              `Account created, but the code could not be sent to ${verificationEmail}.`,
          );
          router.push("/auth/verify-otp");
          return;
        }

        toast.success("Verification code sent to your email");
        router.push("/auth/verify-otp");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/staff",
      });
    } catch {
      toast.error("Google sign up failed");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Left Column: Staff Overview */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground mb-4">
              <ShieldCheck size={13} className="text-primary" />
              <span>Epidemic Surveillance Unit</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight mb-4">
              Healthcare Staff Registration
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Create your authorized staff account to participate in national
              cholera surveillance, record water telemetry, validate clinical cases,
              and receive real-time predictive outbreak warnings.
            </p>

            <div className="space-y-3 rounded-xl border bg-card p-5 text-xs">
              <p className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                Staff Capabilities & Responsibilities:
              </p>
              <div className="grid gap-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <PlusCircle size={14} className="text-primary shrink-0" />
                  <span>Submit confirmed & suspect cholera disease cases</span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain size={14} className="text-blue-500 shrink-0" />
                  <span>Upload environmental water telemetry & batch CSV datasets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCheck size={14} className="text-amber-500 shrink-0" />
                  <span>Validate suspect records & clinical dehydration grades</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-500 shrink-0" />
                  <span>Analyze epidemiological curves & transmission dynamics</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileDown size={14} className="text-purple-500 shrink-0" />
                  <span>Generate and export clinical outbreak surveillance reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-500 shrink-0" />
                  <span>Access ML outbreak predictions & receive critical risk alerts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="w-full rounded-xl border bg-card p-8 shadow-xs">
            <h2 className="text-xl font-semibold tracking-tight mb-1">
              Create Staff Account
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Enter your professional credentials to get started
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  Full name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Dr. / Officer Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">
                  Official email address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@hospital.gov / name@domain.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs">
                  Confirm password *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(v) => setTermsAccepted(!!v)}
                />
                <Label
                  htmlFor="terms"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-foreground underline underline-offset-4"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-foreground underline underline-offset-4"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !termsAccepted}
              >
                {loading ? "Creating account..." : "Register as Staff"}
              </Button>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                or continue with
              </span>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full gap-2"
              onClick={handleGoogleSignUp}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google
            </Button>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              Already registered?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
