import Link from "next/link";
import {
  ArrowRight,
  Droplets,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const metrics = [
  { value: "96%", label: "Triage Accuracy" },
  { value: "< 0.4s", label: "Model Latency" },
  { value: "7-Day", label: "Outbreak Warning" },
  { value: "WHO", label: "EWARS Standard" },
];

const pipeline = [
  {
    step: "01",
    title: "Data Ingestion",
    desc: "Clinical symptom reports and water quality telemetry uploaded in real time.",
  },
  {
    step: "02",
    title: "AI Risk Inference",
    desc: "Neural models synthesize microbiological indicators to forecast cluster outbreaks.",
  },
  {
    step: "03",
    title: "Rapid Intervention",
    desc: "Instant WHO dehydration triage and automated risk alerts dispatched to teams.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="size-7 rounded bg-primary text-primary-foreground font-mono font-bold text-xs flex items-center justify-center">
              CP
            </span>
            <span className="text-sm font-semibold tracking-tight">
              CholeraPredict
            </span>
          </Link>

          <nav className="hidden items-center gap-6 sm:flex text-xs text-muted-foreground">
            <a href="#pipeline" className="hover:text-foreground transition-colors">
              Pipeline
            </a>
            <a href="#protocol" className="hover:text-foreground transition-colors">
              Protocol
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="h-8 text-xs">
              <Link href="/auth/register">
                Get Started <ArrowRight size={12} className="ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                Predict Outbreaks. <br />
                Prevent Epidemics.
              </h1>

              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
                Machine-learning surveillance synthesizing clinical symptom reports and hydrological water quality to detect cholera clusters before wide transmission.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="sm" className="h-9 px-4 text-xs font-medium">
                  <Link href="/auth/register">
                    Launch Console <ArrowRight size={13} className="ml-1.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="h-9 px-4 text-xs font-medium">
                  <Link href="/auth/login">Sign In to Dashboard</Link>
                </Button>
              </div>
            </div>

            {/* Live Telemetry Snapshot Card */}
            <div className="mt-12 rounded-lg border bg-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Droplets size={14} className="text-destructive" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Live Surveillance Snapshot
                  </span>
                  <span className="text-xs text-muted-foreground">· Gasabo Station</span>
                </div>
                <span className="text-xs font-semibold text-destructive uppercase tracking-wide">
                  High Risk Cluster
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded border bg-background p-3">
                  <span className="text-[11px] text-muted-foreground block mb-1">Outbreak Hazard</span>
                  <span className="text-xl font-bold text-destructive">88%</span>
                </div>
                <div className="rounded border bg-background p-3">
                  <span className="text-[11px] text-muted-foreground block mb-1">Dehydration Triage</span>
                  <span className="text-xl font-bold text-destructive">Severe</span>
                </div>
                <div className="rounded border bg-background p-3">
                  <span className="text-[11px] text-muted-foreground block mb-1">Water Quality</span>
                  <span className="text-xl font-bold text-amber-600">Critical</span>
                </div>
                <div className="rounded border bg-background p-3">
                  <span className="text-[11px] text-muted-foreground block mb-1">Free Chlorine</span>
                  <span className="text-xl font-bold text-foreground">0.05 mg/L</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="border-b bg-card py-6">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {metrics.map((m) => (
                <div key={m.label} className="text-center sm:text-left">
                  <span className="text-2xl font-bold tracking-tight block">{m.value}</span>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pipeline Section */}
        <section id="pipeline" className="border-b py-16 sm:py-20 bg-muted/20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-10">
              <span className="text-xs font-mono font-semibold uppercase text-primary tracking-wider">
                Architecture
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">
                Surveillance Pipeline
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {pipeline.map(({ step, title, desc }) => (
                <div key={step} className="rounded-lg border bg-card p-5">
                  <span className="text-xs font-mono font-bold text-muted-foreground block mb-2">
                    {step}
                  </span>
                  <h3 className="font-bold text-sm mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Clinical Emergency Protocol */}
        <section id="protocol" className="py-12 border-b">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-lg border border-red-200 bg-red-50/50 dark:border-red-950 dark:bg-red-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldAlert size={18} className="text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-destructive uppercase tracking-wide">
                    WHO Clinical Protocol
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Early ORS hydration reduces cholera fatality from over 50% to under 0.5%. Begin clean fluid intake immediately upon symptom onset.
                  </p>
                </div>
              </div>
              <Button asChild size="sm" className="h-8 text-xs shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                <Link href="/auth/register">Register Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-xs text-muted-foreground bg-background">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">CholeraPredict</span>
            <span>· ML-Driven Outbreak Prediction System</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/auth/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="hover:text-foreground transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
