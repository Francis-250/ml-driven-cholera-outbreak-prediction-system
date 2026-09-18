"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  MapPin,
  Pencil,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteDiseaseRecord,
  updateDiseaseRecord,
} from "@/actions/admin/records";
import { cn } from "@/lib/utils";

type DiseaseRecord = {
  id: string;
  patientName: string;
  patientAge: number | null;
  patientGender: string | null;
  district: string;
  waterSource: string;
  stoolType: string;
  dehydrationLevel: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  confidenceScore: number;
  validationStatus: "PENDING" | "VALIDATED" | "REJECTED";
  caseType: string;
  symptomsText: string | null;
  validationNotes: string | null;
  reporterEmail: string;
  date: string;
};

const districts = [
  "ALL",
  "Gasabo",
  "Kicukiro",
  "Nyarugenge",
  "Rubavu",
  "Rusizi",
  "Gatsibo",
];

export function AdminRecordsClient({
  initialRecords,
}: {
  initialRecords: DiseaseRecord[];
}) {
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingRecord, setEditingRecord] = useState<DiseaseRecord | null>(null);
  const [editDistrict, setEditDistrict] = useState("");
  const [editRisk, setEditRisk] = useState<"LOW" | "MEDIUM" | "HIGH">("HIGH");
  const [editStatus, setEditStatus] = useState<"PENDING" | "VALIDATED" | "REJECTED">("VALIDATED");
  const [editNotes, setEditNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = records.filter((r) => {
    if (districtFilter !== "ALL" && r.district !== districtFilter) return false;
    if (statusFilter !== "ALL" && r.validationStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.patientName.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.reporterEmail.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this disease record?")) return;
    setMessage(null);
    startTransition(async () => {
      try {
        await deleteDiseaseRecord(id);
        setRecords((prev) => prev.filter((r) => r.id !== id));
        setMessage("Disease record deleted successfully.");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Delete failed.");
      }
    });
  };

  const handleEditOpen = (r: DiseaseRecord) => {
    setEditingRecord(r);
    setEditDistrict(r.district);
    setEditRisk(r.riskLevel);
    setEditStatus(r.validationStatus);
    setEditNotes(r.validationNotes || "");
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;
    setMessage(null);
    startTransition(async () => {
      try {
        await updateDiseaseRecord({
          recordId: editingRecord.id,
          district: editDistrict,
          riskLevel: editRisk,
          validationStatus: editStatus,
          validationNotes: editNotes,
        });
        setRecords((prev) =>
          prev.map((r) =>
            r.id === editingRecord.id
              ? {
                  ...r,
                  district: editDistrict,
                  riskLevel: editRisk,
                  validationStatus: editStatus,
                  validationNotes: editNotes,
                }
              : r,
          ),
        );
        setEditingRecord(null);
        setMessage("Record updated successfully.");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Update failed.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="rounded-xl border bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient, email, district, or ID..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">District:</span>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="h-8 rounded-md border bg-background px-2 text-xs"
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border bg-background px-2 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="VALIDATED">Validated</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <span className="text-muted-foreground font-semibold">
            {filtered.length} records
          </span>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs text-primary">
          {message}
        </div>
      )}

      {/* Edit Modal / Drawer Form If active */}
      {editingRecord && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <p className="font-bold text-sm">
              Edit Disease Record #{editingRecord.id.slice(0, 8)} - {editingRecord.patientName}
            </p>
            <Button onClick={() => setEditingRecord(null)} variant="ghost" size="xs">
              Close
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-medium block mb-1">District</label>
              <Input
                value={editDistrict}
                onChange={(e) => setEditDistrict(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="font-medium block mb-1">Risk Level</label>
              <select
                value={editRisk}
                onChange={(e) => setEditRisk(e.target.value as any)}
                className="w-full h-8 rounded-md border bg-background px-2 text-xs"
              >
                <option value="HIGH">HIGH RISK</option>
                <option value="MEDIUM">MEDIUM RISK</option>
                <option value="LOW">LOW RISK</option>
              </select>
            </div>
            <div>
              <label className="font-medium block mb-1">Validation Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full h-8 rounded-md border bg-background px-2 text-xs"
              >
                <option value="VALIDATED">VALIDATED</option>
                <option value="PENDING">PENDING</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-medium block mb-1 text-xs">Validation / Administrative Notes</label>
            <Input
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Administrative justification or laboratory confirmation notes..."
              className="h-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSaveEdit} disabled={isPending} size="sm" className="text-xs">
              Save Changes
            </Button>
            <Button onClick={() => setEditingRecord(null)} variant="outline" size="sm" className="text-xs">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="divide-y">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No disease records match the current filters.
            </div>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors text-xs"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm">{r.patientName}</span>
                    <Badge variant="outline" className="text-[10px]">
                      <MapPin size={9} className="mr-0.5" /> {r.district}
                    </Badge>
                    <Badge
                      variant={
                        r.riskLevel === "HIGH"
                          ? "destructive"
                          : r.riskLevel === "MEDIUM"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-[10px]"
                    >
                      {r.riskLevel}
                    </Badge>
                    <Badge
                      variant={
                        r.validationStatus === "VALIDATED"
                          ? "default"
                          : r.validationStatus === "REJECTED"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {r.validationStatus}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      #{r.id.slice(0, 8)}
                    </span>
                  </div>

                  <p className="text-muted-foreground">
                    Reporter: {r.reporterEmail} · Source: {r.waterSource} · Dehydration: <strong>{r.dehydrationLevel}</strong> · Stool: {r.stoolType}
                  </p>

                  {r.validationNotes && (
                    <p className="italic text-[11px] text-muted-foreground/80">
                      Note: &quot;{r.validationNotes}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-muted-foreground text-[11px] mr-2">{r.date}</span>
                  <Button
                    onClick={() => handleEditOpen(r)}
                    variant="outline"
                    size="icon-xs"
                    title="Edit record"
                  >
                    <Pencil size={12} />
                  </Button>
                  <Button
                    onClick={() => handleDelete(r.id)}
                    disabled={isPending}
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive hover:bg-destructive/10"
                    title="Delete record"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
