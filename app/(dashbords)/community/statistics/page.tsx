import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Droplets,
  HeartPulse,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { requireCommunityPage } from "@/lib/community-auth";
import prisma from "@/lib/prisma";

export default async function CommunityStatisticsPage() {
  await requireCommunityPage();

  const [cases, environmental] = await Promise.all([
    prisma.assessment.findMany({
      select: {
        district: true,
        riskLevel: true,
        dehydrationLevel: true,
        validationStatus: true,
        waterSource: true,
        createdAt: true,
      },
    }),
    prisma.environmentalData.findMany({
      select: {
        district: true,
        waterSource: true,
        waterContaminationLevel: true,
        chlorineResidual: true,
        sanitationScore: true,
        outbreakRiskScore: true,
        riskLevel: true,
      },
    }),
  ]);

  const totalCases = cases.length;
  const validatedCount = cases.filter((c) => c.validationStatus === "VALIDATED").length;
  const highRiskCount = cases.filter((c) => c.riskLevel === "HIGH").length;
  const mediumRiskCount = cases.filter((c) => c.riskLevel === "MEDIUM").length;
  const lowRiskCount = cases.filter((c) => c.riskLevel === "LOW").length;

  // Group by district
  const districtCounts: Record<string, { total: number; high: number; validated: number }> = {};
  for (const c of cases) {
    const d = c.district || "Unspecified";
    if (!districtCounts[d]) districtCounts[d] = { total: 0, high: 0, validated: 0 };
    districtCounts[d].total += 1;
    if (c.riskLevel === "HIGH") districtCounts[d].high += 1;
    if (c.validationStatus === "VALIDATED") districtCounts[d].validated += 1;
  }

  // Water source correlation
  const waterCounts: Record<string, number> = {};
  for (const c of cases) {
    const w = c.waterSource || "Other";
    waterCounts[w] = (waterCounts[w] || 0) + 1;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Epidemiological Transparency
          </span>
          <span className="text-xs text-muted-foreground">· Public Outbreak Statistics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Cholera Outbreak Statistics & Trends
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          Open community access to disease transmission indicators, safe water compliance rates, and regional surveillance metrics.
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Reports</span>
            <Activity size={16} className="text-primary" />
          </div>
          <p className="text-3xl font-bold mt-2">{totalCases}</p>
          <p className="text-xs text-muted-foreground mt-1">Community & clinical records</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Clinically Validated</span>
            <ShieldCheck size={16} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">{validatedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalCases > 0 ? Math.round((validatedCount / totalCases) * 100) : 0}% confirmation rate
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">High Risk / Severe</span>
            <AlertTriangle size={16} className="text-destructive" />
          </div>
          <p className="text-3xl font-bold mt-2 text-destructive">{highRiskCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Severe dehydration cases</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Water Stations</span>
            <Droplets size={16} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">{environmental.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active surveillance points</p>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* District Distribution */}
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-semibold mb-1">Cases Reported by District</p>
          <p className="text-xs text-muted-foreground mb-4">Total submissions and proportion flagged high risk</p>

          <div className="space-y-3.5">
            {Object.keys(districtCounts).length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No district data logged yet.</p>
            ) : (
              Object.entries(districtCounts).map(([district, stats]) => {
                const percentage = totalCases > 0 ? Math.round((stats.total / totalCases) * 100) : 0;
                return (
                  <div key={district} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-1.5">
                        <MapPin size={12} className="text-muted-foreground" /> {district}
                      </span>
                      <span className="text-muted-foreground">
                        {stats.total} cases ({stats.high} high risk)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Risk Level Distribution */}
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-semibold mb-1">Dehydration & Risk Level Distribution</p>
          <p className="text-xs text-muted-foreground mb-4">Proportion of patients by clinical urgency tier</p>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-red-700 font-medium dark:text-red-300">High Risk (Severe Dehydration)</span>
                <span className="font-semibold">{highRiskCount} ({totalCases > 0 ? Math.round((highRiskCount / totalCases) * 100) : 0}%)</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${totalCases > 0 ? (highRiskCount / totalCases) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-amber-700 font-medium dark:text-amber-300">Moderate Risk (Some Dehydration)</span>
                <span className="font-semibold">{mediumRiskCount} ({totalCases > 0 ? Math.round((mediumRiskCount / totalCases) * 100) : 0}%)</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${totalCases > 0 ? (mediumRiskCount / totalCases) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-700 font-medium dark:text-emerald-300">Low Risk (Mild / Hydrated)</span>
                <span className="font-semibold">{lowRiskCount} ({totalCases > 0 ? Math.round((lowRiskCount / totalCases) * 100) : 0}%)</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${totalCases > 0 ? (lowRiskCount / totalCases) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          <div>
            <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
              Suspected Water Source Association
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(waterCounts).map(([source, count]) => (
                <Badge key={source} variant="outline" className="text-xs py-1">
                  {source}: <span className="font-bold ml-1">{count}</span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
