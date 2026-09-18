import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Flame,
  LifeBuoy,
  MapPin,
  ShieldAlert,
  Sparkles,
  Waves,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireCommunityPage } from "@/lib/community-auth";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function CommunityHotspotsPage() {
  await requireCommunityPage();

  const [environmental, cases] = await Promise.all([
    prisma.environmentalData.findMany({
      orderBy: { outbreakRiskScore: "desc" },
    }),
    prisma.assessment.findMany({
      select: { district: true, riskLevel: true },
    }),
  ]);

  // Aggregate high risk counts per district
  const districtHighRisk: Record<string, number> = {};
  for (const c of cases) {
    if (c.riskLevel === "HIGH" && c.district) {
      districtHighRisk[c.district] = (districtHighRisk[c.district] || 0) + 1;
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
            Epidemic Surveillance
          </span>
          <span className="text-xs text-muted-foreground">· Hotspot Monitoring</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          High-Risk Cholera Transmission Regions
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          Real-time geographical tracking of contaminated water bodies, flood runoff zones, and severe diarrhea cluster locations.
        </p>
      </div>

      {/* Advisory Header */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 mb-8">
        <div className="flex items-start gap-3">
          <AlertOctagon size={20} className="text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-destructive">
              Active Public Health Warning: Boil Water Advisory in Effect
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Surveillance teams report critical bacterial counts in shallow wells and river basins following recent precipitation. Do not consume untreated water from open taps, surface wells, or rivers in high-risk zones.
            </p>
          </div>
        </div>
      </div>

      {/* Hotspots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {environmental.map((hotspot) => {
          const highCount = districtHighRisk[hotspot.district] || 0;
          const isHigh = hotspot.riskLevel === "HIGH";

          return (
            <div
              key={hotspot.id}
              className={cn(
                "rounded-xl border p-5 bg-card flex flex-col justify-between transition-all",
                isHigh
                  ? "border-red-200 dark:border-red-900/60 shadow-xs"
                  : "border-border",
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-semibold flex items-center gap-1">
                      <MapPin size={13} className="text-primary" /> {hotspot.district}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {hotspot.location || "General Catchment"}
                    </p>
                  </div>
                  <Badge
                    variant={isHigh ? "destructive" : "secondary"}
                    className="text-[10px] font-bold shrink-0"
                  >
                    {hotspot.riskLevel} RISK ({hotspot.outbreakRiskScore}%)
                  </Badge>
                </div>

                <div className="space-y-2 rounded-lg bg-muted/40 p-3 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Water Contamination</span>
                    <span className={cn("font-semibold", isHigh ? "text-destructive" : "text-foreground")}>
                      {hotspot.waterContaminationLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Water Source</span>
                    <span className="font-medium">{hotspot.waterSource}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chlorine Residual</span>
                    <span className="font-medium">
                      {hotspot.chlorineResidual !== null ? `${hotspot.chlorineResidual} mg/L` : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Severe Clinical Cases</span>
                    <span className="font-bold text-destructive">{highCount}</span>
                  </div>
                </div>

                {hotspot.notes && (
                  <p className="text-xs text-muted-foreground italic mb-4 leading-relaxed">
                    &quot;{hotspot.notes}&quot;
                  </p>
                )}
              </div>

              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {hotspot.floodRisk ? "⚠️ Flood Risk Observed" : "✓ No Flooding"}
                </span>
                <Button asChild size="xs" variant="ghost">
                  <Link href="/community/symptoms">Report Here</Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safe Water Distribution & Protection Section */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <LifeBuoy size={18} className="text-primary" />
          <h2 className="text-base font-bold">Safe Drinking Water Guidelines for Monitored Regions</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-muted/30 border space-y-1.5">
            <p className="font-bold text-sm text-foreground">1. Vigorous Boiling</p>
            <p className="text-muted-foreground leading-relaxed">
              Bring water to a rolling boil for at least 1 full minute before drinking, cooking, or brushing teeth. Store in clean, covered containers with narrow spouts.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border space-y-1.5">
            <p className="font-bold text-sm text-foreground">2. Chlorine Disinfection</p>
            <p className="text-muted-foreground leading-relaxed">
              Add 1 water purification tablet (e.g., Aquatabs) per 20 liters of clear water. Wait 30 minutes before drinking to ensure complete inactivation of bacteria.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border space-y-1.5">
            <p className="font-bold text-sm text-foreground">3. Immediate Isolation</p>
            <p className="text-muted-foreground leading-relaxed">
              Anyone with sudden profuse watery diarrhea should be taken to the district Cholera Treatment Center immediately while continuously drinking ORS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
