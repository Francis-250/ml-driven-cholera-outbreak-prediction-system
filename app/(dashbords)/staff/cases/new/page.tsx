"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  PlusCircle,
} from "lucide-react";
import { submitDiseaseCase } from "@/actions/staff/cases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const choleraSymptoms = [
  { id: "profuse_watery_diarrhea", label: "Profuse acute watery diarrhea (rice-water stool)" },
  { id: "severe_vomiting", label: "Effortless projectile / severe vomiting" },
  { id: "dehydration_sunken_eyes", label: "Sunken eyes & dry mucous membranes" },
  { id: "skin_pinch_tenting", label: "Prolonged skin pinch tenting (>2 seconds)" },
  { id: "muscle_cramps", label: "Painful muscle & calf cramps (electrolyte loss)" },
  { id: "rapid_weak_pulse", label: "Rapid, weak or absent radial pulse (hypovolemic shock)" },
  { id: "extreme_thirst", label: "Unquenchable thirst / drinks eagerly" },
  { id: "lethargy_weakness", label: "Lethargy, stupor, or unconsciousness" },
  { id: "low_urine", label: "Anuria / Oliguria (absence of urine output)" },
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
  "River / Stream Runoff",
  "Lake Kivu / Open Water",
  "Water Truck / Tanker",
];

export default function StaffSubmitDiseaseCasePage() {
  const router = useRouter();
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Female");
  const [district, setDistrict] = useState("Gasabo");
  const [waterSource, setWaterSource] = useState("Municipal Piped Tap");
  const [stoolType, setStoolType] = useState("Rice-water pale cloudy stool");
  const [dehydrationLevel, setDehydrationLevel] = useState<"NONE" | "SOME" | "SEVERE">("SOME");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    "profuse_watery_diarrhea",
    "severe_vomiting",
  ]);
  const [treatmentInitiated, setTreatmentInitiated] = useState("IV Ringer's Lactate (100ml/kg) + ORS solution");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setError("Please enter the patient name or case ID.");
      return;
    }
    if (selectedSymptoms.length === 0) {
      setError("Select at least one symptom/sign.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await submitDiseaseCase({
          patientName,
          patientAge: patientAge ? parseInt(patientAge, 10) : 30,
          patientGender,
          district,
          waterSource,
          stoolType,
          dehydrationLevel,
          symptoms: selectedSymptoms,
          clinicalNotes,
          treatmentInitiated,
        });
        router.push("/staff/cases");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to record case.");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button asChild variant="ghost" size="xs">
          <Link href="/staff/cases">
            <ChevronLeft size={14} className="mr-1" /> Back to Disease Cases
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Clinical Surveillance
          </span>
          <span className="text-xs text-muted-foreground">· Staff Record Entry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Submit Confirmed or Suspected Cholera Case
        </h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Record acute watery diarrhea and cholera cases directly into the national early-warning surveillance registry.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Demographic & Location */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            1. Patient Demographics & Exposure Location
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Patient Full Name / Code *</Label>
              <Input
                id="name"
                placeholder="e.g. John Bosco / PT-8821"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="age" className="text-xs">Age (years)</Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g. 35"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-xs">Gender</Label>
              <select
                id="gender"
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full h-9 rounded-md border bg-background px-3 text-xs"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Child/Infant">Child / Infant</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">District / Epidemiological Zone *</Label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-9 rounded-md border bg-background px-3 text-xs"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d} District
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Suspected Drinking Water Source *</Label>
              <select
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                className="w-full h-9 rounded-md border bg-background px-3 text-xs"
              >
                {waterSources.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Clinical Presentation */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            2. Clinical Presentation & Dehydration Status
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Stool Appearance</Label>
              <select
                value={stoolType}
                onChange={(e) => setStoolType(e.target.value)}
                className="w-full h-9 rounded-md border bg-background px-3 text-xs"
              >
                <option value="Rice-water pale cloudy stool">Rice-water pale cloudy stool (Classic Vibrio)</option>
                <option value="Acute watery stool (non-bloody)">Acute watery stool (non-bloody)</option>
                <option value="Loose soft stool">Loose soft stool</option>
                <option value="Mucoid stool">Mucoid stool</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Assessed WHO Dehydration Level *</Label>
              <select
                value={dehydrationLevel}
                onChange={(e) => setDehydrationLevel(e.target.value as any)}
                className="w-full h-9 rounded-md border bg-background px-3 text-xs font-semibold"
              >
                <option value="SEVERE">SEVERE DEHYDRATION (Lethargic/shock, skin pinch &gt;2s, weak pulse)</option>
                <option value="SOME">SOME / MODERATE DEHYDRATION (Sunken eyes, thirsty, restless)</option>
                <option value="NONE">NO DEHYDRATION (Alert, normal drinking)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Label className="text-xs font-semibold block mb-2">
              Observed Clinical Signs & Symptoms ({selectedSymptoms.length} selected)
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {choleraSymptoms.map(({ id, label }) => {
                const active = selectedSymptoms.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle(id)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-md border text-left text-xs transition-colors",
                      active
                        ? "bg-primary/10 border-primary text-foreground font-medium"
                        : "bg-background border-border text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    <span
                      className={cn(
                        "size-3 rounded-full border",
                        active ? "bg-primary border-primary" : "border-muted-foreground",
                      )}
                    />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Treatment & Notes */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            3. Treatment Initiated & Staff Clinical Notes
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="treatment" className="text-xs">Immediate Treatment Administered</Label>
            <Input
              id="treatment"
              placeholder="e.g. IV Ringer's Lactate (100ml/kg), ORS therapy, Doxycycline 300mg"
              value={treatmentInitiated}
              onChange={(e) => setTreatmentInitiated(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs">Clinical Examination & Epidemiological Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Observations on cluster contact, rapid diagnostic test (RDT) result, or CTC admission notes..."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="text-xs resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button asChild variant="outline">
            <Link href="/staff/cases">Cancel</Link>
          </Button>

          <Button type="submit" disabled={isPending} className="gap-1.5">
            {isPending ? (
              <span className="size-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
            ) : (
              <>
                <PlusCircle size={15} />
                <span>Submit & Validate Clinical Case</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
