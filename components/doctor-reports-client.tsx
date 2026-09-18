"use client";

import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Filter,
  MapPin,
  Printer,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CaseItem = {
  id: string;
  patientName: string;
  age: number | null;
  gender: string | null;
  district: string;
  waterSource: string;
  stoolType: string;
  dehydrationLevel: string;
  riskLevel: string;
  confidenceScore: number;
  validationStatus: string;
  caseType: string;
  date: string;
  createdAtIso: string;
};

type EnvItem = {
  id: string;
  district: string;
  location: string | null;
  waterSource: string;
  waterContaminationLevel: string;
  chlorineResidual: number | null;
  sanitationScore: number | null;
  rainfallMm: number | null;
  outbreakRiskScore: number;
  riskLevel: string;
  date: string;
};

export function DoctorReportsClient({
  cases,
  environmental,
}: {
  cases: CaseItem[];
  environmental: EnvItem[];
}) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const filteredCases = cases.filter((c) => {
    if (selectedDistrict !== "ALL" && c.district !== selectedDistrict) return false;
    if (selectedStatus !== "ALL" && c.validationStatus !== selectedStatus) return false;
    return true;
  });

  const totalFiltered = filteredCases.length;
  const severeCount = filteredCases.filter((c) => c.dehydrationLevel === "SEVERE").length;
  const validatedCount = filteredCases.filter((c) => c.validationStatus === "VALIDATED").length;

  const downloadCSV = () => {
    const headers = [
      "Case ID",
      "Date",
      "Patient Name",
      "Age",
      "Gender",
      "District",
      "Water Source",
      "Stool Type",
      "Dehydration Level",
      "Risk Level",
      "Confidence (%)",
      "Status",
    ];
    const rows = filteredCases.map((c) => [
      `"${c.id}"`,
      `"${c.date}"`,
      `"${c.patientName}"`,
      `"${c.age ?? "N/A"}"`,
      `"${c.gender ?? "N/A"}"`,
      `"${c.district}"`,
      `"${c.waterSource}"`,
      `"${c.stoolType}"`,
      `"${c.dehydrationLevel}"`,
      `"${c.riskLevel}"`,
      `"${c.confidenceScore}"`,
      `"${c.validationStatus}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cholera_outbreak_report_${selectedDistrict.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const districts = ["Gasabo", "Kicukiro", "Nyarugenge", "Rubavu", "Rusizi", "Gatsibo"];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Epidemiological Surveillance
            </span>
            <span className="text-xs text-muted-foreground">· Report Generation & Export</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Generate Cholera Outbreak Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Filter surveillance metrics, compile regional attack rates, and export data in standard CSV or printable format.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1.5 text-xs">
            <Printer size={13} /> Print Summary
          </Button>
          <Button onClick={downloadCSV} size="sm" className="gap-1.5 text-xs">
            <Download size={13} /> Export Report CSV
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="rounded-xl border bg-card p-5 mb-8 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Filter size={13} /> Report Scope & Filters
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1">Target District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full h-9 rounded-md border bg-background px-3 text-xs"
            >
              <option value="ALL">All Monitored Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d} District</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1">Validation Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-9 rounded-md border bg-background px-3 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="VALIDATED">Validated (Confirmed Cholera)</option>
              <option value="PENDING">Pending Clinician Review</option>
              <option value="REJECTED">Dismissed / Non-Cholera</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Summary Header */}
      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-2xl font-bold">{totalFiltered}</p>
          <p className="text-xs text-muted-foreground mt-1">Cases in Report</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-2xl font-bold text-destructive">{severeCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Severe Dehydration</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{validatedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Confirmed Cholera Cases</p>
        </div>
      </div>

      {/* Report Data Table Preview */}
      <div className="rounded-xl border bg-card overflow-hidden mb-8">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Report Preview: Showing {filteredCases.length} records
          </p>
        </div>

        <div className="divide-y max-h-[600px] overflow-y-auto">
          {filteredCases.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No records match your selected report filters.
            </div>
          ) : (
            filteredCases.map((c) => (
              <div
                key={c.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{c.patientName}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {c.district}
                    </Badge>
                    <Badge
                      variant={
                        c.riskLevel === "HIGH"
                          ? "destructive"
                          : c.riskLevel === "MEDIUM"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-[10px]"
                    >
                      {c.riskLevel}
                    </Badge>
                    <Badge
                      variant={c.validationStatus === "VALIDATED" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {c.validationStatus}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Water: {c.waterSource} · Dehydration: <strong>{c.dehydrationLevel}</strong> · Stool: {c.stoolType}
                  </p>
                </div>
                <span className="text-muted-foreground shrink-0">{c.date}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
