"use client";

import { useState, useTransition } from "react";
import {
  Activity,
  CloudRain,
  Download,
  FileDown,
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  exportAuditLogsCSV,
  exportDiseaseCasesCSV,
  exportEnvironmentalDataCSV,
} from "@/actions/admin/reports";

export function AdminReportsClient({
  caseCount,
  environmentalCount,
  auditLogCount,
}: {
  caseCount: number;
  environmentalCount: number;
  auditLogCount: number;
}) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDownload = (type: "cases" | "environmental" | "audit") => {
    setDownloading(type);
    startTransition(async () => {
      try {
        let csvContent = "";
        let filename = "";

        if (type === "cases") {
          csvContent = await exportDiseaseCasesCSV();
          filename = `cholera_disease_cases_export_${new Date().toISOString().slice(0, 10)}.csv`;
        } else if (type === "environmental") {
          csvContent = await exportEnvironmentalDataCSV();
          filename = `environmental_surveillance_export_${new Date().toISOString().slice(0, 10)}.csv`;
        } else {
          csvContent = await exportAuditLogsCSV();
          filename = `system_audit_logs_export_${new Date().toISOString().slice(0, 10)}.csv`;
        }

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        alert("Failed to export report: " + (err instanceof Error ? err.message : "Unknown error"));
      } finally {
        setDownloading(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report Card: Disease Cases */}
        <div className="rounded-xl border bg-card p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-base mb-1">Cholera Disease Cases Report</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Complete registry of clinical cases, field symptom reports, patient ages, districts, dehydration severity, and validation outcomes.
            </p>
            <p className="text-xs font-semibold text-foreground mb-4">
              Available Records: <span className="text-primary">{caseCount}</span>
            </p>
          </div>

          <Button
            onClick={() => handleDownload("cases")}
            disabled={isPending}
            className="w-full gap-2 text-xs"
          >
            {downloading === "cases" ? (
              <span className="size-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
            ) : (
              <>
                <Download size={14} /> Export Cases CSV
              </>
            )}
          </Button>
        </div>

        {/* Report Card: Environmental Data */}
        <div className="rounded-xl border bg-card p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="size-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <CloudRain size={20} />
            </div>
            <h3 className="font-bold text-base mb-1">Environmental Surveillance Report</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Water point contamination levels, residual chlorine mg/L, precipitation, temperature, flood vulnerability, and calculated outbreak risk scores.
            </p>
            <p className="text-xs font-semibold text-foreground mb-4">
              Available Records: <span className="text-blue-500">{environmentalCount}</span>
            </p>
          </div>

          <Button
            onClick={() => handleDownload("environmental")}
            disabled={isPending}
            variant="outline"
            className="w-full gap-2 text-xs"
          >
            {downloading === "environmental" ? (
              <span className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <>
                <Download size={14} /> Export Environmental CSV
              </>
            )}
          </Button>
        </div>

        {/* Report Card: Audit Logs */}
        <div className="rounded-xl border bg-card p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-base mb-1">System Audit & Compliance Logs</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Immutable audit records of user registrations, role adjustments, account suspensions, case submissions, validations, and exports.
            </p>
            <p className="text-xs font-semibold text-foreground mb-4">
              Available Logs: <span className="text-emerald-500">{auditLogCount}</span>
            </p>
          </div>

          <Button
            onClick={() => handleDownload("audit")}
            disabled={isPending}
            variant="outline"
            className="w-full gap-2 text-xs"
          >
            {downloading === "audit" ? (
              <span className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <>
                <Download size={14} /> Export Audit Logs CSV
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
