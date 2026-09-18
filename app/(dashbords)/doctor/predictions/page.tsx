import {
  AlertOctagon,
  AlertTriangle,
  Brain,
  CheckCircle2,
  CloudRain,
  Droplets,
  MapPin,
  Radio,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireDoctorPage } from "@/lib/doctor-auth";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function DoctorPredictionsPage() {
  await requireDoctorPage();

  const [environmental, severeCases] = await Promise.all([
    prisma.environmentalData.findMany({
      orderBy: { outbreakRiskScore: "desc" },
      include: {
        uploadedBy: { select: { name: true } },
      },
    }),
    prisma.assessment.findMany({
      where: { riskLevel: "HIGH" },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const criticalAlerts = environmental.filter((e) => e.riskLevel === "HIGH");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Epidemic Forecasting Unit
            </span>
            <span className="text-xs text-muted-foreground">· Machine Learning Early Warning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Outbreak Predictions & Real-Time Risk Alerts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl leading-relaxed">
            Multi-source machine learning models synthesizing microbiological water contamination, rainfall runoff, and acute diarrhea clusters to predict outbreaks before widespread transmission.
          </p>
        </div>

        <Button asChild className="gap-1.5 shrink-0">
          <Link href="/doctor/environmental">Upload New Surveillance</Link>
        </Button>
      </div>

      {/* Critical Risk Alerts Feed */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Radio size={16} className="text-destructive animate-pulse" />
          <span>Active Epidemiological Risk Alerts ({criticalAlerts.length})</span>
        </div>

        {criticalAlerts.length === 0 ? (
          <div className="rounded-xl border bg-card p-6 text-center text-xs text-muted-foreground">
            <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
            No active high-risk cholera outbreak alerts currently triggered.
          </div>
        ) : (
          criticalAlerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border border-red-300 bg-red-50/80 p-5 dark:border-red-900/60 dark:bg-red-950/30 text-red-950 dark:text-red-200 shadow-xs"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertOctagon size={22} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">
                        HIGH EPIDEMIC TRANSMISSION HAZARD: {alert.district}
                      </span>
                      <Badge variant="destructive" className="text-[10px] font-bold">
                        Risk Score: {alert.outbreakRiskScore}%
                      </Badge>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed opacity-90 max-w-2xl">
                      {alert.notes ||
                        "Severe fecal coliform contamination detected alongside insufficient residual chlorination. Immediate community mobilization and safe water distribution recommended."}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-semibold text-red-800 dark:text-red-300">
                      <span>Source: {alert.waterSource}</span>
                      <span>·</span>
                      <span>Chlorine: {alert.chlorineResidual ?? 0} mg/L (WHO Target: &ge; 0.5)</span>
                      <span>·</span>
                      <span>24h Rain: {alert.rainfallMm ?? 0} mm</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild size="sm" variant="destructive" className="text-xs">
                    <Link href="/doctor/validate">Triage Cases in {alert.district}</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* District Outbreak Probability Table */}
      <div className="rounded-xl border bg-card overflow-hidden mb-8">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Predicted Attack Rate & Outbreak Risk by Surveillance Station</p>
            <p className="text-xs text-muted-foreground">ML probability derived from hydrological and biological vectors</p>
          </div>
        </div>

        <div className="divide-y">
          {environmental.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No environmental surveillance prediction records yet.
            </div>
          ) : (
            environmental.map((d) => (
              <div
                key={d.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{d.district}</span>
                    <span className="text-muted-foreground">({d.location || "Catchment Zone"})</span>
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
                  <p className="text-muted-foreground">
                    Contamination: <strong>{d.waterContaminationLevel}</strong> · Source: {d.waterSource} · Residual Chlorine: {d.chlorineResidual ?? "N/A"} mg/L · Rainfall: {d.rainfallMm ?? "N/A"} mm
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right w-24">
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
