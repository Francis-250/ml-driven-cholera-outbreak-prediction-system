import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Droplets,
  MapPin,
  PhoneCall,
  RefreshCw,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { requireCommunityPage } from "@/lib/community-auth";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";

type Risk = "HIGH" | "MEDIUM" | "LOW";

const riskConfig: Record<
  Risk,
  {
    icon: React.ElementType;
    iconColor: string;
    label: string;
    labelColor: string;
    ring: string;
    badge: string;
    bar: string;
  }
> = {
  HIGH: {
    icon: AlertTriangle,
    iconColor: "text-red-500",
    label: "High Outbreak Risk",
    labelColor: "text-red-700 dark:text-red-300",
    ring: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
    badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300",
    bar: "bg-red-500",
  },
  MEDIUM: {
    icon: AlertCircle,
    iconColor: "text-amber-500",
    label: "Moderate Cholera Risk",
    labelColor: "text-amber-700 dark:text-amber-300",
    ring: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300",
    bar: "bg-amber-400",
  },
  LOW: {
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    label: "Low Cholera Risk",
    labelColor: "text-emerald-700 dark:text-emerald-300",
    ring: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function SymptomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCommunityPage();
  const { id } = await params;

  const assessment = await prisma.assessment.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      doctorComments: {
        include: {
          doctorProfile: {
            include: { user: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!assessment) notFound();

  const cfg = riskConfig[assessment.riskLevel];
  const Icon = cfg.icon;
  const confidence = Math.round(assessment.confidenceScore * 100);
  const detectedSymptoms = Array.isArray(assessment.detectedSymptoms)
    ? (assessment.detectedSymptoms as string[])
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Back Link */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <Link
          href="/community"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={14} /> Back to Dashboard
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-xs text-muted-foreground">
          Assessment #{assessment.id.slice(0, 8)}
        </span>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock size={11} /> {formatDateTime(assessment.createdAt)}
        </span>
      </div>

      {/* High Risk Critical Warning Banner */}
      {assessment.riskLevel === "HIGH" && (
        <div className="mb-6 rounded-xl border border-red-300 bg-red-100/90 p-5 text-red-950 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          <div className="flex items-start gap-3.5">
            <ShieldAlert size={24} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold tracking-tight">
                URGENT: HIGH RISK CHOLERA & SEVERE DEHYDRATION DETECTED
              </p>
              <p className="text-xs mt-1 leading-relaxed">
                Patient displays acute danger indicators. Proceed immediately to the nearest Cholera Treatment Center (CTC). Continuously administer Oral Rehydration Solution (ORS) while traveling. Call toll-free 114 for medical escort.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Summary & Actions */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <div
              className={cn(
                "w-14 h-14 rounded-full border-2 flex items-center justify-center mb-4",
                cfg.ring,
              )}
            >
              <Icon size={26} className={cfg.iconColor} />
            </div>
            <p className={cn("text-lg font-bold", cfg.labelColor)}>
              {cfg.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">
              AI Confidence: {confidence}%
            </p>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full", cfg.bar)}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>

          {/* Clinical Surveillance Indicators */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Surveillance Metrics
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between border-b pb-1.5">
                <span className="text-muted-foreground">District / Hotspot</span>
                <span className="font-semibold">{assessment.district || "Gasabo"}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Dehydration Severity</span>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {assessment.dehydrationLevel || "SOME"}
                </Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Cholera Risk Score</span>
                <span className="font-bold">{assessment.choleraRiskScore}/10</span>
              </div>
              <div className="flex items-center justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Stool Appearance</span>
                <span className="font-medium">{assessment.stoolType || "Watery"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Water Source</span>
                <span className="font-medium">{assessment.waterSource || "Tap"}</span>
              </div>
            </div>
          </div>

          {/* Clinician Validation Status */}
          <div className="rounded-xl border bg-card p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Clinician Review Status
            </p>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  assessment.validationStatus === "VALIDATED"
                    ? "default"
                    : assessment.validationStatus === "REJECTED"
                      ? "destructive"
                      : "secondary"
                }
                className="text-xs"
              >
                {assessment.validationStatus === "VALIDATED"
                  ? "✓ Clinically Validated"
                  : assessment.validationStatus === "REJECTED"
                    ? "Dismissed / Non-Cholera"
                    : "Pending Clinician Review"}
              </Badge>
            </div>
            {assessment.validationNotes && (
              <p className="text-xs text-muted-foreground mt-2 italic bg-muted/40 p-2.5 rounded-md">
                &quot;{assessment.validationNotes}&quot;
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/community/symptoms">
                <RefreshCw size={13} className="mr-1.5" /> Start New Check
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/community">
                <ChevronLeft size={13} className="mr-1.5" /> Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Side: Rehydration Guidance & AI Explanation */}
        <div className="lg:col-span-2 space-y-5">
          {/* Actionable Recommendation Card */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Immediate Life-Saving Guidance
            </p>
            <p className="text-sm font-medium leading-relaxed">
              {assessment.recommendation}
            </p>
          </div>

          {/* Rehydration & Water Protocol */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <Droplets size={16} />
              <p className="text-xs font-semibold uppercase tracking-wider">
                WHO Rehydration & Water Chlorination Protocol
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 space-y-1.5">
                <p className="font-semibold text-foreground">1. Oral Rehydration Salts (ORS)</p>
                <p className="text-muted-foreground leading-relaxed">
                  Mix 1 sachet in 1 liter of safe water (or 6 tsp sugar + 1/2 tsp salt in 1L water). Give 1 cup after every loose stool.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 space-y-1.5">
                <p className="font-semibold text-foreground">2. Safe Water Treatment</p>
                <p className="text-muted-foreground leading-relaxed">
                  Boil drinking water vigorously for at least 1 minute or add chlorine water purification tablets according to instructions.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 space-y-1.5">
                <p className="font-semibold text-foreground">3. Zinc Supplementation</p>
                <p className="text-muted-foreground leading-relaxed">
                  For children under 5: 20mg zinc daily for 10-14 days (10mg for infants under 6 months) to reduce diarrhea duration.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 space-y-1.5">
                <p className="font-semibold text-foreground">4. Barrier Sanitation</p>
                <p className="text-muted-foreground leading-relaxed">
                  Wash hands thoroughly with soap after latrine use and before preparing food. Disinfect stools and vomitus with 0.5% bleach.
                </p>
              </div>
            </div>
          </div>

          {/* Symptoms Detected */}
          <div className="rounded-xl border bg-card p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Identified Symptoms
            </p>
            <div className="flex flex-wrap gap-1.5">
              {detectedSymptoms.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs font-normal">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          {/* AI Clinical Reasoning */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider">
                Epidemiological AI Analysis
              </p>
            </div>
            <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line bg-muted/30 p-4 rounded-lg">
              {assessment.aiResponse}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
