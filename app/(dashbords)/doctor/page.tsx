import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCheck,
  CloudRain,
  FileDown,
  MapPin,
  PlusCircle,
  ShieldAlert,
  Stethoscope,
  TrendingUp,
  UploadCloud,
  FileSpreadsheet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireDoctorPage } from "@/lib/doctor-auth";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function DoctorDashboard() {
  const session = await requireDoctorPage();

  const [allCases, pendingCount, highRiskCount, environmentalAlerts] =
    await Promise.all([
      prisma.assessment.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true } },
        },
      }),
      prisma.assessment.count({
        where: { validationStatus: "PENDING" },
      }),
      prisma.assessment.count({
        where: { riskLevel: "HIGH" },
      }),
      prisma.environmentalData.findMany({
        where: { riskLevel: "HIGH" },
        take: 3,
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const totalCases = await prisma.assessment.count();
  const environmentalCount = await prisma.environmentalData.count();

  const stats = [
    {
      label: "Total Disease Records",
      value: totalCases,
      href: "/doctor/cases",
      description: "Clinical cases & community reports",
    },
    {
      label: "Pending Validation",
      value: pendingCount,
      href: "/doctor/validate",
      urgent: pendingCount > 0,
      description: "Community suspect cases to review",
    },
    {
      label: "Severe / High Risk Cases",
      value: highRiskCount,
      href: "/doctor/cases",
      destructive: highRiskCount > 0,
      description: "Emergency CTC referral candidates",
    },
    {
      label: "Surveillance Stations",
      value: environmentalCount,
      href: "/doctor/environmental",
      description: "Water quality & telemetry points",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Top Banner & Header Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Clinician Surveillance Dashboard
            </span>
            <span className="text-xs text-muted-foreground">
              · Epidemic Response Unit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Doctor Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome, Dr. {session.user.name}. Submit disease cases, upload
            environmental telemetry & CSV datasets, validate community reports,
            and monitor transmission curves.
          </p>
        </div>

        {/* Top Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" className="gap-1.5 shadow-xs">
            <Link href="/doctor/cases/new">
              <PlusCircle size={14} /> Submit Disease Case
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 shadow-xs">
            <Link href="/doctor/environmental">
              <UploadCloud size={14} /> Upload Data / CSV
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 shadow-xs">
            <Link href="/doctor/validate">
              <CheckCheck size={14} /> Validate
              {pendingCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200"
                >
                  {pendingCount}
                </Badge>
              )}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 shadow-xs">
            <Link href="/doctor/reports">
              <FileDown size={14} /> Generate Reports
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 shadow-xs">
            <Link href="/doctor/predictions">
              <ShieldAlert size={14} /> Predictions & Alerts
              {environmentalAlerts.length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 text-[10px] px-1.5 py-0 h-4"
                >
                  {environmentalAlerts.length}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* Environmental Outbreak Warning If Any */}
      {environmentalAlerts.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 mb-6 dark:border-red-900/60 dark:bg-red-950/20 text-red-950 dark:text-red-200 shadow-xs">
          <div className="flex items-start gap-3">
            <ShieldAlert size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-sm">
                Active Critical Outbreak Alerts in {environmentalAlerts.length}{" "}
                Surveillance Zone(s)
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {environmentalAlerts.map((a) => (
                  <Badge
                    key={a.id}
                    variant="destructive"
                    className="text-[10px]"
                  >
                    {a.district}: {a.waterContaminationLevel} Contamination
                    (Score: {a.outbreakRiskScore}%)
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              asChild
              size="xs"
              variant="outline"
              className="bg-background text-foreground text-xs shrink-0"
            >
              <Link href="/doctor/predictions">View Priority Alerts</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="p-5 rounded-xl border bg-card hover:bg-muted/30 transition-all hover:shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                {s.value}
              </p>
              {s.urgent && (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200"
                >
                  Needs Review
                </Badge>
              )}
              {s.destructive && (
                <Badge variant="destructive" className="text-[10px]">
                  Urgent
                </Badge>
              )}
            </div>
            <p className="text-xs font-semibold text-foreground mt-2 group-hover:text-primary transition-colors">
              {s.label}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {s.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Role Functionality Cards Grid (All 6 Doctor Duties) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Core Clinician Responsibilities & Tools
          </p>
          <span className="text-[11px] text-muted-foreground">
            6 Specialized Workspaces
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Submit Disease Cases */}
          <Link
            href="/doctor/cases/new"
            className="p-5 rounded-xl border bg-card hover:border-primary hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <PlusCircle size={18} />
                </div>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                  Clinical Intake
                </Badge>
              </div>
              <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                Submit Disease Cases
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Register clinical suspect or confirmed cholera patients with dehydration levels, stool consistency, and water sources.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-primary">
              <span>Register Patient</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Upload Environmental Data */}
          <Link
            href="/doctor/environmental"
            className="p-5 rounded-xl border bg-card hover:border-blue-500 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <CloudRain size={18} />
                </div>
                <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-300">
                  Telemetry & CSV
                </Badge>
              </div>
              <p className="text-sm font-semibold group-hover:text-blue-500 transition-colors">
                Upload Environmental Data
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload water bacterial contamination lab tests, residual chlorine, rainfall mm, or bulk import full CSV datasets.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-blue-600">
              <span>Upload CSV / Telemetry</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Validate Records */}
          <Link
            href="/doctor/validate"
            className="p-5 rounded-xl border bg-card hover:border-amber-500 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <CheckCheck size={18} />
                </div>
                {pendingCount > 0 ? (
                  <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-800 border-amber-300">
                    {pendingCount} Pending
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    All Caught Up
                  </Badge>
                )}
              </div>
              <p className="text-sm font-semibold group-hover:text-amber-500 transition-colors">
                Validate Records
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clinical review queue to examine community self-reports, confirm or reject cholera diagnoses, and attach clinical instructions.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-amber-600">
              <span>Review Verification Queue</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. Analyze Trends */}
          <Link
            href="/doctor/trends"
            className="p-5 rounded-xl border bg-card hover:border-emerald-500 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                  Analytics
                </Badge>
              </div>
              <p className="text-sm font-semibold group-hover:text-emerald-500 transition-colors">
                Analyze Trends
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Study epidemic curves, attack rates, and district transmission trajectories to identify evolving disease clusters.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span>View Epidemic Curves</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 5. Generate Reports */}
          <Link
            href="/doctor/reports"
            className="p-5 rounded-xl border bg-card hover:border-purple-500 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <FileDown size={18} />
                </div>
                <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-300">
                  Reporting
                </Badge>
              </div>
              <p className="text-sm font-semibold group-hover:text-purple-500 transition-colors">
                Generate Reports
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate and export clinical surveillance summaries, district attack rates, and epidemiological outbreak reports.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-purple-600">
              <span>Generate & Export</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 6. View Predictions & Receive Risk Alerts */}
          <Link
            href="/doctor/predictions"
            className="p-5 rounded-xl border bg-card hover:border-rose-500 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <ShieldAlert size={18} />
                </div>
                <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-300">
                  ML Early Warning
                </Badge>
              </div>
              <p className="text-sm font-semibold group-hover:text-rose-500 transition-colors">
                View Predictions & Alerts
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Consult 7-day predictive district outbreak probabilities, ML hazard scorings, and real-time high-risk community alerts.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-rose-600">
              <span>View Predictions</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Disease Records Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Recent Disease Cases & Reports</p>
            <p className="text-xs text-muted-foreground">
              Latest clinical and community submissions awaiting or completed surveillance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="gap-1 text-xs">
              <Link href="/doctor/cases">
                View All Disease Records ({totalCases})
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1 text-xs">
              <Link href="/doctor/cases/new">
                <PlusCircle size={13} /> New Case
              </Link>
            </Button>
          </div>
        </div>

        <div className="divide-y">
          {allCases.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No disease cases registered yet.
            </div>
          ) : (
            allCases.map((c) => (
              <div
                key={c.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold">
                      {c.patientName || c.user.name}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      <MapPin size={9} className="mr-0.5" /> {c.district || "District"}
                    </Badge>
                    <Badge
                      variant={
                        c.riskLevel === "HIGH"
                          ? "destructive"
                          : c.riskLevel === "MEDIUM"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-[10px]"
                    >
                      {c.riskLevel} RISK
                    </Badge>
                    <Badge
                      variant={
                        c.validationStatus === "VALIDATED"
                          ? "default"
                          : c.validationStatus === "REJECTED"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {c.validationStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dehydration: <strong>{c.dehydrationLevel || "SOME"}</strong> · Stool: {c.stoolType || "Watery"} · Water: {c.waterSource || "Tap"} · Reported: {formatDate(c.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {c.validationStatus === "PENDING" ? (
                    <Button asChild size="xs" variant="default" className="gap-1 text-xs">
                      <Link href="/doctor/validate">
                        <CheckCheck size={12} /> Validate Record
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="xs" variant="outline" className="gap-1 text-xs">
                      <Link href="/doctor/cases">
                        <ArrowRight size={12} /> View Details
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
