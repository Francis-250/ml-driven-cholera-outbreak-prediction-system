"use client";

import { useState } from "react";
import {
  Download,
  Filter,
  MapPin,
  Printer,
  ShieldCheck,
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

export function StaffReportsClient({
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
  const highRiskCount = filteredCases.filter((c) => c.riskLevel === "HIGH").length;

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
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `cholera_outbreak_report_${selectedDistrict.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

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

  const currentDate = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return (
    <div>
      {/* ============================================================ */}
      {/* 1. SCREEN VIEW ONLY (HIDDEN ON PRINT)                        */}
      {/* ============================================================ */}
      <div className="print:hidden max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
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
              Filter surveillance metrics, compile regional attack rates, and print or export data.
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
                  <option key={d} value={d}>
                    {d} District
                  </option>
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
                <option value="PENDING">Pending Staff Review</option>
                <option value="REJECTED">Dismissed / Non-Cholera</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
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
            <p className="text-2xl font-bold text-primary">{validatedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Confirmed Cholera Cases</p>
          </div>
        </div>

        {/* Screen Data Table Preview */}
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

      {/* ============================================================ */}
      {/* 2. DEDICATED OFFICIAL PRINTABLE REPORT (PRINT VIEW ONLY)     */}
      {/* ============================================================ */}
      <div className="hidden print:block w-full bg-white text-black p-4 font-sans text-xs">
        {/* Official Header */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-700">
                Epidemiological Surveillance & Early Warning Directorate
              </p>
              <h1 className="text-xl font-extrabold uppercase tracking-tight mt-0.5">
                ML-Driven Cholera Outbreak Prediction System
              </h1>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                Official Clinical Surveillance & Outbreak Report
              </p>
            </div>
            <div className="text-right text-[10px] text-gray-600 space-y-0.5">
              <p><span className="font-bold text-black">Generated:</span> {currentDate}</p>
              <p><span className="font-bold text-black">Scope:</span> {selectedDistrict === "ALL" ? "All Monitored Districts" : `${selectedDistrict} District`}</p>
              <p><span className="font-bold text-black">Validation:</span> {selectedStatus}</p>
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics Strip */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="border border-black p-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-600 block">Total Cases Evaluated</span>
            <span className="text-lg font-extrabold text-black">{totalFiltered}</span>
          </div>
          <div className="border border-black p-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-600 block">Confirmed Cholera</span>
            <span className="text-lg font-extrabold text-black">{validatedCount}</span>
          </div>
          <div className="border border-black p-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-600 block">Severe Dehydration (Plan C)</span>
            <span className="text-lg font-extrabold text-black">{severeCount}</span>
          </div>
          <div className="border border-black p-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-600 block">Critical Risk Alerts</span>
            <span className="text-lg font-extrabold text-black">{highRiskCount}</span>
          </div>
        </div>

        {/* Printable Data Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-black text-left text-[11px]">
            <thead>
              <tr className="bg-gray-100 border-b border-black text-[10px] uppercase font-bold">
                <th className="border border-black p-2 w-8 text-center">#</th>
                <th className="border border-black p-2">Date</th>
                <th className="border border-black p-2">Patient / Subject</th>
                <th className="border border-black p-2">Age / Sex</th>
                <th className="border border-black p-2">District</th>
                <th className="border border-black p-2">Water Source</th>
                <th className="border border-black p-2">Dehydration Grade</th>
                <th className="border border-black p-2">Risk Level</th>
                <th className="border border-black p-2">Validation Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-black p-4 text-center text-gray-500">
                    No records found matching the active reporting parameters.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c, idx) => (
                  <tr key={c.id} className="border-b border-gray-300 break-inside-avoid">
                    <td className="border border-black p-2 text-center font-mono text-[10px]">
                      {idx + 1}
                    </td>
                    <td className="border border-black p-2 whitespace-nowrap">
                      {c.date}
                    </td>
                    <td className="border border-black p-2 font-semibold">
                      {c.patientName}
                    </td>
                    <td className="border border-black p-2 whitespace-nowrap">
                      {c.age ?? "—"} / {c.gender?.charAt(0) ?? "—"}
                    </td>
                    <td className="border border-black p-2">
                      {c.district}
                    </td>
                    <td className="border border-black p-2">
                      {c.waterSource}
                    </td>
                    <td className="border border-black p-2 font-medium">
                      {c.dehydrationLevel}
                    </td>
                    <td className="border border-black p-2 font-bold">
                      {c.riskLevel}
                    </td>
                    <td className="border border-black p-2">
                      {c.validationStatus}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Official Sign-off & Verification Footer */}
        <div className="border-t border-black pt-4 mt-8 break-inside-avoid text-[10px] text-gray-700">
          <div className="flex justify-between items-end">
            <div className="max-w-md space-y-1">
              <p className="font-bold uppercase text-black">
                Public Health Surveillance Verification
              </p>
              <p>
                This document is an authenticated epidemiological summary produced by the ML-Driven Cholera Outbreak Prediction System. Data is compiled for outbreak monitoring and emergency response planning in accordance with World Health Organization (WHO) Early Warning, Alert and Response (EWARS) protocols.
              </p>
            </div>
            <div className="text-right space-y-3">
              <div>
                <p className="text-[10px] text-gray-500 mb-6">Attesting Surveillance Officer Signature:</p>
                <div className="border-b border-black w-48 ml-auto" />
                <p className="text-[9px] font-mono mt-1 text-gray-600">Authorized Public Health Staff</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
