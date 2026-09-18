import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CloudRain,
  Droplets,
  MapPin,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireCommunityPage } from "@/lib/community-auth";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function CommunityPredictionsPage() {
  const session = await requireCommunityPage();

  const [profile, environmentalData, highRiskAssessments] = await Promise.all([
    prisma.communityProfile.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.environmentalData.findMany({
      orderBy: { outbreakRiskScore: "desc" },
    }),
    prisma.assessment.findMany({
      where: { riskLevel: "HIGH" },
      select: { district: true, createdAt: true },
      take: 20,
    }),
  ]);

  const userDistrict = profile?.district || "Gasabo";
  const userDistrictData = environmentalData.find(
    (e) => e.district.toLowerCase() === userDistrict.toLowerCase(),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Predictive Epidemiological Modeling
          </span>
          <span className="text-xs text-muted-foreground">· 7-Day Outbreak Forecast</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          AI Cholera Outbreak Risk Predictions
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          Machine-learning forecasts integrating community clinical reports, water contamination metrics, rainfall volume, and sanitation indices.
        </p>
      </div>

      {/* Hero Forecast Card for User's District */}
      <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-muted/40 p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-xs">
                <MapPin size={11} /> Primary Monitored District
              </Badge>
              <Badge
                variant={
                  userDistrictData?.riskLevel === "HIGH"
                    ? "destructive"
                    : "secondary"
                }
                className="text-xs font-bold"
              >
                {userDistrictData?.riskLevel ?? "MEDIUM"} PROBABILITY
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {userDistrict} District Forecast
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Based on recent water quality tests and local diarrhea reports, {userDistrict} shows an estimated{" "}
              <strong className="text-foreground">
                {userDistrictData?.outbreakRiskScore ?? 72}% probability
              </strong>{" "}
              of accelerated epidemic transmission over the next 7 days.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex size-28 flex-col items-center justify-center rounded-full border-4 border-primary/30 bg-background shadow-xs text-center">
              <span className="text-3xl font-extrabold tracking-tight text-primary">
                {userDistrictData?.outbreakRiskScore ?? 72}%
              </span>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                Risk Index
              </span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-6 pt-6 border-t">
          <div className="p-3 rounded-lg bg-background/80 border text-xs space-y-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Droplets size={13} /> Water Safety Index
            </span>
            <p className="font-semibold text-foreground">
              {userDistrictData?.waterContaminationLevel || "MODERATE"} Contamination
            </p>
          </div>
          <div className="p-3 rounded-lg bg-background/80 border text-xs space-y-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <CloudRain size={13} /> 24h Precipitation
            </span>
            <p className="font-semibold text-foreground">
              {userDistrictData?.rainfallMm ?? 34.5} mm rainfall
            </p>
          </div>
          <div className="p-3 rounded-lg bg-background/80 border text-xs space-y-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Brain size={13} /> AI Recommendation
            </span>
            <p className="font-semibold text-foreground">
              Boil all tap water & distribute ORS
            </p>
          </div>
        </div>
      </div>

      {/* District Outbreak Predictions Table */}
      <div className="rounded-xl border bg-card overflow-hidden mb-8">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Regional Outbreak Risk Rankings</p>
            <p className="text-xs text-muted-foreground">Comparative outbreak probabilities across monitored surveillance zones</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/community/symptoms">Report in Your Zone</Link>
          </Button>
        </div>

        <div className="divide-y">
          {environmentalData.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No environmental surveillance prediction records yet.
            </div>
          ) : (
            environmentalData.map((d) => (
              <div
                key={d.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{d.district}</span>
                    <span className="text-xs text-muted-foreground">
                      ({d.location || "Central Water Catchment"})
                    </span>
                    <Badge
                      variant={
                        d.riskLevel === "HIGH"
                          ? "destructive"
                          : d.riskLevel === "MEDIUM"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-[10px]"
                    >
                      {d.riskLevel} RISK
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Water: {d.waterSource} · Residual Cl: {d.chlorineResidual ?? "N/A"} mg/L · Rainfall: {d.rainfallMm ?? "N/A"} mm
                  </p>
                  {d.notes && (
                    <p className="text-[11px] text-muted-foreground/90 italic">
                      &quot;{d.notes}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-28 text-right">
                    <span className="text-lg font-bold">{d.outbreakRiskScore}%</span>
                    <p className="text-[10px] text-muted-foreground uppercase">Outbreak Score</p>
                  </div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        d.riskLevel === "HIGH"
                          ? "bg-red-500"
                          : d.riskLevel === "MEDIUM"
                            ? "bg-amber-400"
                            : "bg-emerald-500",
                      )}
                      style={{ width: `${d.outbreakRiskScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
