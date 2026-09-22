import Link from "next/link";
import {
  ArrowRight,
  CheckCheck,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireStaffPage } from "@/lib/staff-auth";
import prisma from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function StaffDashboard() {
  const session = await requireStaffPage();

  const [allCases, pendingCount, highRiskCount, environmentalAlerts] =
    await Promise.all([
      prisma.assessment.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
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
      href: "/staff/cases",
      subtext: "Clinical cases & surveillance reports",
    },
    {
      label: "Pending Validation",
      value: pendingCount,
      href: "/staff/validate",
      urgent: pendingCount > 0,
      subtext: pendingCount > 0 ? "Requires staff review" : "All records validated",
    },
    {
      label: "Severe / High Risk Cases",
      value: highRiskCount,
      href: "/staff/cases",
      destructive: highRiskCount > 0,
      subtext: highRiskCount > 0 ? "Critical triage alerts" : "No critical cases",
    },
    {
      label: "Surveillance Stations",
      value: environmentalCount,
      href: "/staff/environmental",
      subtext: "Active water & telemetry points",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Minimal Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Staff Surveillance Overview
          </span>
          <span className="text-xs text-muted-foreground">
            · Epidemic Response Unit
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Staff Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome, {session.user.name}. Real-time cholera surveillance, environmental telemetry, and outbreak prediction.
        </p>
      </div>

      {/* Active Environmental Hazard Alert (if any) */}
      {environmentalAlerts.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 mb-8 dark:border-red-900/60 dark:bg-red-950/20 text-red-950 dark:text-red-200 shadow-xs">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-semibold text-sm">
                Active Outbreak Warnings in {environmentalAlerts.length} Surveillance Zone(s)
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {environmentalAlerts.map((a) => (
                  <Badge
                    key={a.id}
                    variant="destructive"
                    className="text-[10px] font-normal"
                  >
                    {a.district}: {a.waterContaminationLevel} Contamination ({a.outbreakRiskScore}% risk)
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
              <Link href="/staff/predictions">View Alerts</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Minimal Key Metric Cards */}
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
                  Review
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
              {s.subtext}
            </p>
          </Link>
        ))}
      </div>

      {/* Minimal Recent Disease Records Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Recent Disease Surveillance Records</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest clinical cases and triage submissions
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="/staff/cases">
              View All Records ({totalCases})
            </Link>
          </Button>
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
                    <span className="text-xs font-semibold">
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
                    Dehydration: <strong>{c.dehydrationLevel || "SOME"}</strong> · Stool: {c.stoolType || "Watery"} · Water: {c.waterSource || "Tap"} · {formatDate(c.createdAt)}
                  </p>
                </div>

                <div className="shrink-0">
                  {c.validationStatus === "PENDING" ? (
                    <Button asChild size="xs" variant="default" className="text-xs gap-1">
                      <Link href="/staff/validate">
                        <CheckCheck size={12} /> Validate
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="xs" variant="ghost" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                      <Link href="/staff/cases">
                        Details <ArrowRight size={11} />
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
