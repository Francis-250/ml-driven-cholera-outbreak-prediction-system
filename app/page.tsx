import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  ClipboardCheck,
  CloudRain,
  Droplets,
  HeartPulse,
  LifeBuoy,
  MapPin,
  Menu,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const roleCards = [
  {
    role: "Administrator",
    icon: Users,
    desc: "Oversee system security, user permissions, disease records, and authoritative reporting.",
    features: [
      "Manage users & role privileges",
      "Manage disease records & cases",
      "Export authoritative epidemiological reports",
      "View immutable system audit logs",
    ],
  },
  {
    role: "Doctor / Clinician",
    icon: Stethoscope,
    desc: "Submit clinical cases, upload environmental surveillance data, and direct interventions.",
    features: [
      "Submit clinical disease cases",
      "Upload environmental & water data",
      "Validate community records",
      "Analyze trends & generate reports",
      "View predictions & receive risk alerts",
    ],
  },
  {
    role: "Community User",
    icon: LifeBuoy,
    desc: "Empower households with rapid symptom self-assessment, ORS guidance, and hazard alerts.",
    features: [
      "View outbreak dashboards",
      "Provide symptoms for rapid AI triage",
      "Analyze public statistics & trends",
      "View local outbreak predictions",
      "Monitor high-risk regions & hotspots",
    ],
  },
];

const steps = [
  {
    number: "01",
    icon: Droplets,
    title: "Surveillance & Symptom Input",
    description:
      "Community members report symptoms; clinicians upload water contamination and precipitation data.",
  },
  {
    number: "02",
    icon: Brain,
    title: "ML Risk & Dehydration Scoring",
    description:
      "Machine learning models synthesize hydrological vectors and clinical signs to forecast attack rates and triage dehydration.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Validation & Epidemic Response",
    description:
      "Doctors validate clusters, administrators export reports, and communities receive instant life-saving rehydration protocols.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Home">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
              CP
            </span>
            <span className="text-sm font-semibold tracking-tight">
              CholeraPredict
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#roles" className="hover:text-foreground transition-colors">Roles & Capabilities</a>
            <a href="#prevention" className="hover:text-foreground transition-colors">Prevention & ORS</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-xs">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="text-xs">
              <Link href="/auth/register">
                Get started <ArrowRight size={14} className="ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <Badge variant="outline" className="mb-6 rounded-full px-3 py-1 font-normal text-xs gap-1.5">
                <Activity size={13} className="text-destructive animate-pulse" /> ML-Driven Epidemic Surveillance
              </Badge>
              <h1 className="max-w-3xl text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                Predict Outbreaks. <br /> Protect Communities.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                An advanced predictive surveillance system integrating acute symptom reports, environmental water quality indicators, and machine learning to forecast cholera outbreaks before widespread transmission.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/auth/register">
                    Report Symptoms / Get Started <ArrowRight size={15} className="ml-1.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#roles">Explore System Roles</a>
                </Button>
              </div>

              <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                Compliant with WHO Cholera Outbreak Early Warning, Alert and Response (EWARS) guidelines.
              </p>
            </div>

            {/* Live Preview Card */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Surveillance Triage Preview
                  </p>
                  <p className="text-sm font-bold">Gasabo District Catchment</p>
                </div>
                <Badge variant="destructive" className="font-bold">
                  High Outbreak Hazard
                </Badge>
              </div>

              <div className="grid grid-cols-[auto_1fr] items-center gap-6 py-2">
                <div className="flex size-24 flex-col items-center justify-center rounded-full border-4 border-destructive/20 bg-destructive/5 text-center">
                  <span className="text-2xl font-bold text-destructive">88%</span>
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground">
                    Risk Score
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dehydration Level</span>
                    <strong className="text-destructive">SEVERE (Shock Hazard)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Water Contamination</span>
                    <strong className="text-amber-600">CRITICAL Fecal Coliform</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Residual Chlorine</span>
                    <span>0.05 mg/L (Deficient)</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 text-xs text-destructive space-y-1">
                <p className="font-bold">Emergency Intervention Required</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Start immediate continuous Oral Rehydration Salts (ORS). Prepare IV Ringer&apos;s lactate and mobilize municipal chlorination teams.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Roles & Capabilities Section */}
        <section id="roles" className="scroll-mt-20 border-b py-20 sm:py-24 bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Role-Based Architecture
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Dedicated Workspaces for Every Stakeholder
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Tailored capabilities designed for public health administrators, frontline doctors, and vulnerable communities.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {roleCards.map(({ role, icon: Icon, desc, features }) => (
                <div key={role} className="rounded-2xl border bg-card p-6 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-lg font-bold">{role}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 mb-5 leading-relaxed">
                      {desc}
                    </p>

                    <div className="space-y-2.5 border-t pt-4">
                      {features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2 text-xs">
                          <Check size={13} className="text-primary mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button asChild variant="outline" size="sm" className="mt-6 w-full text-xs">
                    <Link href="/auth/register">Join as {role.split(" ")[0]}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="how-it-works" className="scroll-mt-20 border-b py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                How It Works
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                From Environmental Signal to Clinical Action
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                A seamless data loop that bridges community symptom reporting, hydrological surveillance, and clinician validation.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map(({ number, icon: Icon, title, description }) => (
                <div key={number} className="rounded-xl border bg-card p-6 relative">
                  <span className="font-mono text-xs font-bold text-muted-foreground mb-4 block">
                    {number}
                  </span>
                  <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-base font-bold mb-2">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Prevention & ORS Callout */}
        <section id="prevention" className="scroll-mt-20 py-16 bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="rounded-2xl border bg-card p-8 md:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="max-w-2xl space-y-3">
                  <Badge variant="outline" className="text-xs gap-1">
                    <ShieldAlert size={12} className="text-destructive" /> Vital Rehydration Notice
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    Severe Dehydration Kills in Hours — ORS Saves Lives
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    In cholera outbreaks, rapid rehydration within the first 2 hours reduces mortality from over 50% to under 0.5%. Always begin giving clean Oral Rehydration Solution (ORS) immediately while seeking emergency care.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                  <Button asChild size="lg">
                    <Link href="/auth/register">Report Symptoms Now</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">CholeraPredict</span>
            <span>· ML-Driven Cholera Outbreak Prediction System</span>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login" className="hover:text-foreground">Sign In</Link>
            <Link href="/auth/register" className="hover:text-foreground">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
