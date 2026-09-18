"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Droplets,
  Eye,
  HeartCrack,
  HelpCircle,
  MapPin,
  RefreshCw,
  ShieldAlert,
  ThumbsDown,
} from "lucide-react";
import { createCommunityAssessment } from "@/actions/community/assessments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const symptoms = [
  {
    id: "profuse_watery_diarrhea",
    label: "Profuse watery diarrhea (rice-water stool)",
    icon: Droplets,
    danger: true,
  },
  {
    id: "severe_vomiting",
    label: "Frequent / severe vomiting",
    icon: ThumbsDown,
    danger: true,
  },
  {
    id: "dehydration_sunken_eyes",
    label: "Sunken eyes & dry mouth",
    icon: Eye,
    danger: true,
  },
  {
    id: "skin_pinch_tenting",
    label: "Skin pinch goes back slowly (>2 seconds)",
    icon: Activity,
    danger: true,
  },
  {
    id: "muscle_cramps",
    label: "Severe painful calf / muscle cramps",
    icon: HeartCrack,
    danger: false,
  },
  {
    id: "rapid_weak_pulse",
    label: "Rapid or weak radial pulse",
    icon: Activity,
    danger: true,
  },
  {
    id: "extreme_thirst",
    label: "Extreme unquenchable thirst",
    icon: Droplets,
    danger: false,
  },
  {
    id: "lethargy_weakness",
    label: "Extreme lethargy, confusion, or weakness",
    icon: HelpCircle,
    danger: true,
  },
  {
    id: "low_urine",
    label: "Little to no urination (oliguria)",
    icon: RefreshCw,
    danger: false,
  },
];

const districts = [
  "Gasabo",
  "Kicukiro",
  "Nyarugenge",
  "Rubavu",
  "Rusizi",
  "Gatsibo",
  "Musanze",
  "Huye",
  "Rwamagana",
];

const waterSources = [
  "Municipal Piped Tap",
  "Protected Shallow Well",
  "Unprotected Well / Borehole",
  "River / Stream",
  "Lake Kivu / Open Water",
  "Water Truck / Tanker",
];

export default function ProvideSymptomsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [district, setDistrict] = useState("Gasabo");
  const [waterSource, setWaterSource] = useState("Municipal Piped Tap");
  const [stoolType, setStoolType] = useState("Rice-water pale watery");
  const [text, setText] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Female");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  const dangerCount = symptoms.filter(
    (s) => s.danger && selected.includes(s.id),
  ).length;

  const canSubmit = selected.length > 0 || text.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || isPending) return;
    setError(null);

    startTransition(async () => {
      try {
        const result = await createCommunityAssessment({
          symptoms: selected,
          symptomsText: text,
          district,
          waterSource,
          stoolType,
          patientAge: patientAge ? parseInt(patientAge, 10) : undefined,
          patientGender,
        });
        router.push(`/community/symptoms/${result.assessmentId}`);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to submit symptom report. Please try again.",
        );
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Community Triage
          </span>
          <span className="text-xs text-muted-foreground">· WHO Protocol</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Cholera Symptom Assessment & Triage
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          Select every symptom you or the patient is experiencing. Our machine-learning outbreak engine will estimate dehydration severity and calculate outbreak risk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Clinical Guidance */}
        <div className="space-y-4 order-2 lg:order-1">
          {/* Risk Indicator Card */}
          <div className="rounded-xl border bg-card p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Critical Danger Signs
            </p>
            <div className="flex gap-1.5 mb-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 h-9 rounded-md flex items-center justify-center text-xs font-bold transition-colors",
                    i <= dangerCount
                      ? "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {i}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {dangerCount === 0 && "No critical danger signs currently selected."}
              {dangerCount === 1 && "1 danger sign: early dehydration warning. Start ORS solution immediately."}
              {dangerCount === 2 && "2 danger signs: moderate dehydration. Present at a local clinic."}
              {dangerCount >= 3 && "3+ danger signs: SEVERE CHOLERA RISK! Urgent IV fluids and CTC transfer required!"}
            </p>
          </div>

          {/* Immediate Action Notice */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
            <div className="flex items-center gap-2 mb-2 font-semibold text-xs uppercase tracking-wider">
              <ShieldAlert size={15} className="text-amber-600" />
              Do Not Delay Rehydration
            </div>
            <p className="text-xs leading-relaxed">
              Cholera causes severe rapid dehydration. Death can occur within hours of onset. Always administer Oral Rehydration Salts (ORS) solution continuously en route to medical facilities.
            </p>
          </div>

          {/* Context Card */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Outbreak Hotspot Context
            </p>
            <div className="space-y-2">
              <div>
                <Label className="text-xs">Location / District</Label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full mt-1 h-9 rounded-md border bg-background px-3 text-xs"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d} District
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">Primary Drinking Water Source</Label>
                <select
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value)}
                  className="w-full mt-1 h-9 rounded-md border bg-background px-3 text-xs"
                >
                  {waterSources.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">Stool Appearance</Label>
                <select
                  value={stoolType}
                  onChange={(e) => setStoolType(e.target.value)}
                  className="w-full mt-1 h-9 rounded-md border bg-background px-3 text-xs"
                >
                  <option value="Rice-water pale watery">Rice-water pale / cloudy watery (Classic cholera)</option>
                  <option value="Brown watery diarrhea">Brown watery diarrhea</option>
                  <option value="Soft / loose stool">Soft / loose stool</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Symptoms Selection Form */}
        <div className="lg:col-span-2 order-1 lg:order-2 space-y-5">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Observed Symptoms
              </Label>
              <span className="text-xs text-muted-foreground">
                {selected.length} selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {symptoms.map(({ id, label, icon: Icon, danger }) => {
                const active = selected.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle(id)}
                    className={cn(
                      "relative flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all",
                      active
                        ? "bg-primary/10 border-primary text-foreground shadow-xs font-medium"
                        : "bg-background border-border text-foreground hover:bg-muted/40",
                    )}
                  >
                    <Icon
                      size={16}
                      className={cn(
                        "mt-0.5 shrink-0",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-xs leading-snug">{label}</p>
                    </div>
                    {danger && (
                      <span className="absolute top-2 right-2 flex size-2 rounded-full bg-red-500" title="Key Danger Sign" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patient Details & Textarea */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age" className="text-xs">Patient Age (optional)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g. 28"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="mt-1 h-9 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-xs">Patient Gender</Label>
                <select
                  id="gender"
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full mt-1 h-9 rounded-md border bg-background px-3 text-xs"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="desc" className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                Describe the situation in your own words
              </Label>
              <Textarea
                id="desc"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="e.g., Started having sudden cloudy watery diarrhea this morning with vomiting and severe thirst..."
                className="resize-none text-xs"
              />
            </div>
          </div>

          {isPending && (
            <div className="rounded-xl border bg-muted/40 p-5 text-center">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                Analyzing cholera outbreak risk & calculating dehydration severity...
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Running ML clinical triage models and checking local water hazard indicators.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              {selected.length > 0
                ? `${selected.length} symptom${selected.length > 1 ? "s" : ""} selected`
                : "Select symptoms to analyze"}
            </p>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isPending}
              size="lg"
              className="gap-2"
            >
              <span>Analyze & Submit Report</span>
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
