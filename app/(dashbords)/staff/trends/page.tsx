import {
  Calendar,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireStaffPage } from "@/lib/staff-auth";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function StaffTrendsPage() {
  await requireStaffPage();

  const [cases] = await Promise.all([
    prisma.assessment.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        district: true,
        riskLevel: true,
        dehydrationLevel: true,
        validationStatus: true,
        waterSource: true,
        createdAt: true,
      },
    }),
  ]);

  const totalCases = cases.length;
  const severeCases = cases.filter((c) => c.dehydrationLevel === "SEVERE").length;
  const validatedCases = cases.filter((c) => c.validationStatus === "VALIDATED").length;

  // Group by district
  const districtStats: Record<
    string,
    { total: number; severe: number; validated: number }
  > = {};
  for (const c of cases) {
    const d = c.district || "Unassigned";
    if (!districtStats[d]) districtStats[d] = { total: 0, severe: 0, validated: 0 };
    districtStats[d].total += 1;
    if (c.dehydrationLevel === "SEVERE") districtStats[d].severe += 1;
    if (c.validationStatus === "VALIDATED") districtStats[d].validated += 1;
  }

  // Water source breakdown
  const waterStats: Record<string, number> = {};
  for (const c of cases) {
    const w = c.waterSource || "Other";
    waterStats[w] = (waterStats[w] || 0) + 1;
  }

  // Date progression (last 7 days / buckets)
  const dateBuckets: Record<string, number> = {};
  for (const c of cases) {
    const key = c.createdAt.toISOString().slice(5, 10); // MM-DD
    dateBuckets[key] = (dateBuckets[key] || 0) + 1;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Epidemiological Analytics
            </span>
            <span className="text-xs text-muted-foreground">· Attack Rate & Transmission Dynamics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Analyze Outbreak Trends
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Temporal epidemic curves, spatial cluster dynamics, and water exposure risk correlations.
          </p>
        </div>

        <Button asChild variant="outline" className="gap-1.5 shrink-0">
          <Link href="/staff/reports">Generate Full Report</Link>
        </Button>
      </div>

      {/* Top Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Recorded Cases</p>
          <p className="text-3xl font-bold mt-2">{totalCases}</p>
          <p className="text-xs text-muted-foreground mt-1">Cumulative patient registry</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severe Dehydration</p>
          <p className="text-3xl font-bold mt-2 text-destructive">{severeCases}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalCases > 0 ? Math.round((severeCases / totalCases) * 100) : 0}% of total presentations
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clinically Confirmed</p>
          <p className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">{validatedCases}</p>
          <p className="text-xs text-muted-foreground mt-1">Confirmed by staff</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monitored Zones</p>
          <p className="text-3xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">{Object.keys(districtStats).length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active surveillance districts</p>
        </div>
      </div>

      {/* Grid: Temporal Curve & Attack Rate by District */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Progression / Epidemic Curve */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="text-sm font-bold">Epidemiological Progression Curve</p>
              <p className="text-xs text-muted-foreground">New case frequency grouped by calendar date</p>
            </div>
            <TrendingUp size={16} className="text-primary" />
          </div>

          <div className="space-y-3 pt-2">
            {Object.keys(dateBuckets).length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">No temporal data available.</p>
            ) : (
              Object.entries(dateBuckets).map(([date, count]) => {
                const maxVal = Math.max(...Object.values(dateBuckets), 1);
                const pct = Math.round((count / maxVal) * 100);
                return (
                  <div key={date} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono font-medium flex items-center gap-1.5">
                        <Calendar size={12} className="text-muted-foreground" /> {date}
                      </span>
                      <span className="font-bold">{count} cases</span>
                    </div>
                    <div className="h-3 rounded-md bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-md transition-all"
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Spatial Attack Rates by District */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="text-sm font-bold">Attack Rate Distribution by District</p>
              <p className="text-xs text-muted-foreground">Proportion of cases and severe presentations per district</p>
            </div>
            <MapPin size={16} className="text-destructive" />
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(districtStats).map(([district, stats]) => {
              return (
                <div key={district} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">{district}</span>
                    <span className="text-muted-foreground">
                      {stats.total} total · <strong className="text-destructive">{stats.severe} severe</strong>
                    </span>
                  </div>
                  <div className="h-3 rounded-md bg-muted overflow-hidden flex">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{
                        width: `${totalCases > 0 ? (stats.severe / totalCases) * 100 : 0}%`,
                      }}
                      title="Severe cases"
                    />
                    <div
                      className="h-full bg-primary/70 transition-all"
                      style={{
                        width: `${totalCases > 0 ? ((stats.total - stats.severe) / totalCases) * 100 : 0}%`,
                      }}
                      title="Moderate/Mild cases"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Exposure Correlation: Water Sources & Environmental Data */}
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm font-bold mb-1">Water Source Contamination & Transmission Risk</p>
        <p className="text-xs text-muted-foreground mb-4">
          Correlation between patients&apos; primary water source and detected environmental outbreak hazards
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          {Object.entries(waterStats).map(([source, count]) => (
            <div key={source} className="p-4 rounded-lg bg-muted/40 border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{source}</span>
                <Badge variant="secondary" className="font-bold">{count} cases</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Associated with {Math.round((count / (totalCases || 1)) * 100)}% of reported cases
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
