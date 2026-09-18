import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Clock,
  Droplets,
  MapPin,
  PhoneCall,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { requireCommunityPage } from "@/lib/community-auth";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Risk = "HIGH" | "MEDIUM" | "LOW";

const riskBadge: Record<Risk, string> = {
  HIGH: "bg-red-50 text-red-700 border-red-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  LOW: "bg-green-50 text-green-700 border-green-200",
};

const riskDot: Record<Risk, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-amber-400",
  LOW: "bg-green-500",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function CommunityDashboard() {
  const session = await requireCommunityPage();

  const [profile, assessments, environmentalHotspots, totalValidatedCases] =
    await Promise.all([
      prisma.communityProfile.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.assessment.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.environmentalData.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.assessment.count({
        where: { validationStatus: "VALIDATED" },
      }),
    ]);

  const userDistrict = profile?.district || "Gasabo";
  const districtEnv = environmentalHotspots.find(
    (e) => e.district.toLowerCase() === userDistrict.toLowerCase(),
  );
  const districtRisk = districtEnv?.riskLevel || "MEDIUM";

  const highRiskReports = assessments.filter((a) => a.riskLevel === "HIGH").length;
  const name = session.user.name?.split(" ")[0] ?? "Community Member";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Community Health Surveillance
            </span>
            <Badge variant="outline" className="text-[10px] gap-1 py-0">
              <MapPin size={10} /> {userDistrict} District
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Hello, {name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor local cholera risk, report early symptoms, and protect your household.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/community/symptoms">
              <Stethoscope size={14} className="mr-1.5" /> Check Symptoms
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/community/hotspots">
              <MapPin size={14} className="mr-1.5" /> View Hotspots
            </Link>
          </Button>
        </div>
      </div>

      {/* Outbreak Alert Banner */}
      <div
        className={cn(
          "rounded-xl border p-5 mb-8 transition-colors",
          districtRisk === "HIGH"
            ? "bg-red-50/80 border-red-200 text-red-950 dark:bg-red-950/20 dark:border-red-900 dark:text-red-200"
            : districtRisk === "MEDIUM"
              ? "bg-amber-50/80 border-amber-200 text-amber-950 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-200"
              : "bg-emerald-50/80 border-emerald-200 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-200",
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "p-2 rounded-lg shrink-0",
                districtRisk === "HIGH"
                  ? "bg-red-500 text-white"
                  : districtRisk === "MEDIUM"
                    ? "bg-amber-500 text-white"
                    : "bg-emerald-500 text-white",
              )}
            >
              <ShieldAlert size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold tracking-tight">
                  District Alert: {userDistrict} is under {districtRisk} Cholera Outbreak Risk
                </p>
                <Badge
                  variant={districtRisk === "HIGH" ? "destructive" : "secondary"}
                  className="text-[10px]"
                >
                  Risk Score: {districtEnv?.outbreakRiskScore ?? 65}%
                </Badge>
              </div>
              <p className="text-xs opacity-90 mt-1 max-w-2xl leading-relaxed">
                {districtEnv?.notes ||
                  "Water contamination surveillance active. Boil all drinking water or treat with chlorine tablets before use. Avoid raw unwashed vegetables."}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild size="sm" variant="outline" className="bg-background/80 text-xs">
              <Link href="/community/hotspots">Details</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Quick Prevention & Hotlines */}
        <div className="space-y-4">
          {/* ORS Life-saving Recipe Card */}
          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <Droplets size={16} />
              <p className="text-xs font-semibold uppercase tracking-wider">
                Emergency Home ORS Recipe
              </p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              If watery diarrhea occurs, start rehydration immediately before reaching a health center:
            </p>
            <div className="rounded-lg bg-muted/60 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                <span className="font-medium">Clean boiled water</span>
                <span className="font-semibold">1 Liter</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                <span className="font-medium">Granulated sugar</span>
                <span className="font-semibold">6 level teaspoons</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Clean table salt</span>
                <span className="font-semibold">1/2 level teaspoon</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 italic">
              Drink 1 cup after each loose stool. Continue breastfeeding infants.
            </p>
          </div>

          {/* Emergency Hotlines */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <PhoneCall size={16} className="text-destructive" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rapid Emergency Hotlines
              </p>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 text-xs">
                <div>
                  <p className="font-medium">National Epidemic Toll-Free</p>
                  <p className="text-[10px] text-muted-foreground">24/7 Cholera Response</p>
                </div>
                <Badge variant="outline" className="font-mono font-bold">114</Badge>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 text-xs">
                <div>
                  <p className="font-medium">Emergency Ambulance (SAMU)</p>
                  <p className="text-[10px] text-muted-foreground">Immediate evacuation</p>
                </div>
                <Badge variant="outline" className="font-mono font-bold">912</Badge>
              </div>
            </div>
          </div>

          {/* Stats card */}
          <div className="rounded-xl border bg-card p-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-bold">{assessments.length}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">My Reports</p>
            </div>
            <div>
              <p className="text-xl font-bold text-destructive">{highRiskReports}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">High Risk</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary">{totalValidatedCases}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Confirmed Cases</p>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Past Reports & Surveillance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Nav Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link
              href="/community/symptoms"
              className="group p-4 rounded-xl border bg-card hover:border-primary transition-colors flex flex-col justify-between"
            >
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Stethoscope size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold group-hover:text-primary transition-colors">
                  Provide Symptoms
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  AI triage & dehydration score
                </p>
              </div>
            </Link>

            <Link
              href="/community/statistics"
              className="group p-4 rounded-xl border bg-card hover:border-primary transition-colors flex flex-col justify-between"
            >
              <div className="size-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold group-hover:text-primary transition-colors">
                  Analyze Statistics
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Public epidemic curves
                </p>
              </div>
            </Link>

            <Link
              href="/community/hotspots"
              className="group p-4 rounded-xl border bg-card hover:border-primary transition-colors flex flex-col justify-between col-span-2 sm:col-span-1"
            >
              <div className="size-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold group-hover:text-primary transition-colors">
                  Monitor Hotspots
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Water safety & alerts
                </p>
              </div>
            </Link>
          </div>

          {/* Assessment History */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">My Symptom Check History</p>
                <p className="text-xs text-muted-foreground">Recent submissions and clinician review status</p>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href="/community/symptoms" className="text-xs">
                  New Check <ArrowRight size={12} className="ml-1" />
                </Link>
              </Button>
            </div>

            {assessments.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  No symptom checks submitted yet.
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm mx-auto">
                  If you or someone in your home experiences watery diarrhea or vomiting, submit a symptom report immediately.
                </p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/community/symptoms">Start Symptom Check</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {assessments.map((a) => {
                  const confidence = Math.round(a.confidenceScore * 100);
                  const symptoms = Array.isArray(a.detectedSymptoms)
                    ? (a.detectedSymptoms as string[])
                    : [];

                  return (
                    <Link
                      key={a.id}
                      href={`/community/symptoms/${a.id}`}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">
                            {a.district || "Local District"}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded border",
                              riskBadge[a.riskLevel],
                            )}
                          >
                            {a.riskLevel} RISK
                          </span>
                          {a.validationStatus === "VALIDATED" && (
                            <Badge variant="secondary" className="text-[9px] bg-blue-50 text-blue-700 border-blue-200">
                              Clinician Validated
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {formatDate(a.createdAt)} at {formatTime(a.createdAt)}
                          </span>
                          <span>·</span>
                          <span>Dehydration: {a.dehydrationLevel ?? "SOME"}</span>
                          <span>·</span>
                          <span>Confidence: {confidence}%</span>
                        </p>
                      </div>
                      <ChevronRight
                        size={15}
                        className="text-muted-foreground group-hover:text-foreground transition-colors"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
