"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Droplets,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { validateDiseaseRecord } from "@/actions/staff/validation";
import { cn } from "@/lib/utils";

type PendingRecord = {
  id: string;
  patientName: string;
  district: string;
  waterSource: string;
  stoolType: string;
  dehydrationLevel: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  confidenceScore: number;
  choleraRiskScore: number;
  symptoms: string[];
  symptomsText: string | null;
  aiResponse: string;
  date: string;
};

type RecentValidated = {
  id: string;
  patientName: string;
  district: string;
  validationStatus: string;
  riskLevel: string;
  validationNotes: string | null;
  date: string;
};

export function StaffValidationClient({
  pendingRecords,
  recentValidated,
}: {
  pendingRecords: PendingRecord[];
  recentValidated: RecentValidated[];
}) {
  const [selectedRecord, setSelectedRecord] = useState<PendingRecord | null>(
    pendingRecords[0] || null,
  );
  const [validationNotes, setValidationNotes] = useState("");
  const [confirmedRisk, setConfirmedRisk] = useState<"LOW" | "MEDIUM" | "HIGH">("HIGH");
  const [confirmedDehydration, setConfirmedDehydration] = useState<"NONE" | "SOME" | "SEVERE">("SOME");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (decision: "VALIDATED" | "REJECTED") => {
    if (!selectedRecord) return;
    setStatusMsg(null);

    startTransition(async () => {
      try {
        await validateDiseaseRecord({
          recordId: selectedRecord.id,
          decision,
          validationNotes,
          confirmedRiskLevel: confirmedRisk,
          confirmedDehydrationLevel: confirmedDehydration,
        });
        setStatusMsg(
          `Record #${selectedRecord.id.slice(0, 8)} successfully ${decision.toLowerCase()}!`,
        );
        setValidationNotes("");
      } catch (err) {
        setStatusMsg(err instanceof Error ? err.message : "Validation failed.");
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Clinical Verification
          </span>
          <span className="text-xs text-muted-foreground">· Disease Case Validation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Validate Community Disease Records
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl leading-relaxed">
          Review reported cholera symptoms, corroborate with local water contamination surveillance, and validate or dismiss cases.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Side: Pending List */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Validation ({pendingRecords.length})
            </p>
          </div>

          <div className="divide-y max-h-[600px] overflow-y-auto">
            {pendingRecords.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
                All community reports have been reviewed!
              </div>
            ) : (
              pendingRecords.map((r) => {
                const isSelected = selectedRecord?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRecord(r);
                      setConfirmedRisk(r.riskLevel);
                      setConfirmedDehydration(r.dehydrationLevel as any);
                    }}
                    className={cn(
                      "w-full text-left p-4 transition-colors space-y-1",
                      isSelected ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{r.patientName}</span>
                      <Badge
                        variant={
                          r.riskLevel === "HIGH"
                            ? "destructive"
                            : r.riskLevel === "MEDIUM"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-[9px]"
                      >
                        {r.riskLevel}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <MapPin size={10} /> {r.district} · {r.waterSource}
                    </p>

                    <p className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
                      <Clock size={10} /> {r.date}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center & Right: Selected Record Review & Actions */}
        <div className="lg:col-span-2 space-y-5">
          {selectedRecord ? (
            <div className="rounded-xl border bg-card p-6 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{selectedRecord.patientName}</h2>
                    <Badge variant="outline" className="text-xs">
                      {selectedRecord.district} District
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Case ID: #{selectedRecord.id} · Submitted {selectedRecord.date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      selectedRecord.riskLevel === "HIGH" ? "destructive" : "secondary"
                    }
                    className="text-xs font-bold"
                  >
                    AI Risk: {selectedRecord.riskLevel} ({selectedRecord.confidenceScore}%)
                  </Badge>
                </div>
              </div>

              {/* Clinical Specs */}
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                  <span className="text-muted-foreground">Dehydration Severity</span>
                  <p className="font-bold text-foreground">{selectedRecord.dehydrationLevel}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                  <span className="text-muted-foreground">Stool Appearance</span>
                  <p className="font-bold text-foreground">{selectedRecord.stoolType}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                  <span className="text-muted-foreground">Drinking Water Source</span>
                  <p className="font-bold text-foreground">{selectedRecord.waterSource}</p>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Observed Symptoms & Indicators
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecord.symptoms.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedRecord.symptomsText && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Patient / Community Narrative
                  </p>
                  <p className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-lg leading-relaxed">
                    &quot;{selectedRecord.symptomsText}&quot;
                  </p>
                </div>
              )}

              {/* AI Triage Reasoning */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Automated Epidemiological Triage
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg whitespace-pre-line">
                  {selectedRecord.aiResponse}
                </p>
              </div>

              {/* Clinician Decision Box */}
              <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider">
                  Attending Clinician Decision
                </p>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-xs font-medium block mb-1">Confirmed Risk Level</label>
                    <select
                      value={confirmedRisk}
                      onChange={(e) => setConfirmedRisk(e.target.value as any)}
                      className="w-full h-8 rounded-md border bg-background px-2 text-xs"
                    >
                      <option value="HIGH">HIGH (Severe Cholera Presentation)</option>
                      <option value="MEDIUM">MEDIUM (Moderate Dehydration / Suspected)</option>
                      <option value="LOW">LOW (Mild / Non-Cholera)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Confirmed Dehydration</label>
                    <select
                      value={confirmedDehydration}
                      onChange={(e) => setConfirmedDehydration(e.target.value as any)}
                      className="w-full h-8 rounded-md border bg-background px-2 text-xs"
                    >
                      <option value="SEVERE">SEVERE (Immediate CTC / IV Fluid)</option>
                      <option value="SOME">SOME (Supervised ORS Treatment)</option>
                      <option value="NONE">NONE (Home Hydration)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium block mb-1">
                    Physician Justification & Validation Notes
                  </label>
                  <Textarea
                    rows={2}
                    placeholder="Clinical reason for validation or dismissal (sent to patient)..."
                    value={validationNotes}
                    onChange={(e) => setValidationNotes(e.target.value)}
                    className="text-xs resize-none"
                  />
                </div>

                {statusMsg && (
                  <p className="text-xs p-2.5 rounded bg-primary/10 text-primary border border-primary/20">
                    {statusMsg}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    onClick={() => handleAction("VALIDATED")}
                    disabled={isPending}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  >
                    <ShieldCheck size={15} />
                    <span>Validate as Confirmed Cholera Case</span>
                  </Button>

                  <Button
                    onClick={() => handleAction("REJECTED")}
                    disabled={isPending}
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                  >
                    <XCircle size={15} />
                    <span>Dismiss / Non-Cholera Case</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border bg-card p-12 text-center text-xs text-muted-foreground">
              Select a pending record from the list to begin verification.
            </div>
          )}

          {/* Recently Validated List */}
          <div className="rounded-xl border bg-card p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Recently Validated Cases
            </p>
            <div className="space-y-2">
              {recentValidated.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent validations.</p>
              ) : (
                recentValidated.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{v.patientName}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {v.district}
                      </Badge>
                      <Badge
                        variant={v.validationStatus === "VALIDATED" ? "default" : "destructive"}
                        className="text-[10px]"
                      >
                        {v.validationStatus}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-[11px]">{v.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
