"use client";

import { useState, useTransition, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Download,
  Droplets,
  FileSpreadsheet,
  Filter,
  MapPin,
  PlusCircle,
  Search,
  ShieldAlert,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  bulkUploadEnvironmentalData,
  deleteEnvironmentalData,
  uploadEnvironmentalData,
  type UploadEnvironmentalInput,
} from "@/actions/staff/environmental";
import { cn } from "@/lib/utils";

type RecordItem = {
  id: string;
  district: string;
  location: string | null;
  waterSource: string;
  waterContaminationLevel: string;
  chlorineResidual: number | null;
  sanitationScore: number | null;
  rainfallMm: number | null;
  temperature: number | null;
  turbidityNtu: number | null;
  phLevel: number | null;
  floodRisk: boolean;
  outbreakRiskScore: number;
  riskLevel: string;
  notes: string | null;
  uploader: string;
  date: string;
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

const waterSources = [
  "Municipal Piped Tap",
  "Protected Shallow Well",
  "Unprotected Well / Borehole",
  "River / Stream Runoff",
  "Lake Kivu / Open Water",
  "Water Truck / Tanker",
];

function parseCsvContent(text: string): {
  records: UploadEnvironmentalInput[];
  errors: string[];
} {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { records: [], errors: ["CSV file is empty or missing data rows."] };
  }

  const rawHeaders = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^["']|["']$/g, "").toLowerCase());

  const headerMap: Record<string, number> = {};
  rawHeaders.forEach((h, i) => {
    const clean = h.replace(/[^a-z0-9]/g, "");
    headerMap[clean] = i;
  });

  const getIdx = (...aliases: string[]) => {
    for (const a of aliases) {
      const clean = a.replace(/[^a-z0-9]/g, "").toLowerCase();
      if (headerMap[clean] !== undefined) return headerMap[clean];
    }
    return -1;
  };

  const districtIdx = getIdx("district", "region", "city");
  const locIdx = getIdx("location", "station", "site", "specificlocation");
  const waterSourceIdx = getIdx("watersource", "source", "watertype");
  const levelIdx = getIdx(
    "watercontaminationlevel",
    "contaminationlevel",
    "contamination",
    "risklevel",
  );
  const clIdx = getIdx("chlorineresidual", "chlorine", "freechlorine", "cl");
  const sanIdx = getIdx("sanitationscore", "sanitation", "sanitationscore0100");
  const rainIdx = getIdx("rainfallmm", "rainfall", "rain", "precipitation");
  const tempIdx = getIdx("temperature", "temp", "celsius");
  const turbidityIdx = getIdx("turbidityntu", "turbidity");
  const phIdx = getIdx("phlevel", "ph");
  const floodIdx = getIdx("floodrisk", "flood", "flooding");
  const notesIdx = getIdx("notes", "fieldnotes", "comment", "remarks");

  if (districtIdx === -1) {
    return {
      records: [],
      errors: [
        "Required column 'district' was not detected in CSV header. Please use the template format.",
      ],
    };
  }

  const records: UploadEnvironmentalInput[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cols: string[] = [];
    let inQuote = false;
    let current = "";
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"' || char === "'") {
        inQuote = !inQuote;
      } else if (char === "," && !inQuote) {
        cols.push(current.trim().replace(/^["']|["']$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    cols.push(current.trim().replace(/^["']|["']$/g, ""));

    const districtVal = cols[districtIdx];
    if (!districtVal) {
      errors.push(`Row ${i + 1}: Missing district.`);
      continue;
    }

    const waterSourceVal =
      waterSourceIdx !== -1 && cols[waterSourceIdx]
        ? cols[waterSourceIdx]
        : "Protected Shallow Well";

    let rawLevel =
      levelIdx !== -1 && cols[levelIdx]
        ? cols[levelIdx].toUpperCase()
        : "MODERATE";
    let levelVal: "SAFE" | "MODERATE" | "HIGH" | "CRITICAL" = "MODERATE";
    if (["SAFE", "MODERATE", "HIGH", "CRITICAL"].includes(rawLevel)) {
      levelVal = rawLevel as "SAFE" | "MODERATE" | "HIGH" | "CRITICAL";
    }

    const parseNum = (idx: number) => {
      if (idx === -1 || !cols[idx]) return null;
      const num = parseFloat(cols[idx]);
      return isNaN(num) ? null : num;
    };

    const floodVal =
      floodIdx !== -1 && cols[floodIdx]
        ? ["true", "1", "yes", "y"].includes(cols[floodIdx].toLowerCase())
        : false;

    records.push({
      district: districtVal,
      location: locIdx !== -1 ? cols[locIdx] : undefined,
      waterSource: waterSourceVal,
      waterContaminationLevel: levelVal,
      chlorineResidual: parseNum(clIdx),
      sanitationScore: parseNum(sanIdx),
      rainfallMm: parseNum(rainIdx),
      temperature: parseNum(tempIdx),
      turbidityNtu: parseNum(turbidityIdx),
      phLevel: parseNum(phIdx),
      floodRisk: floodVal,
      notes: notesIdx !== -1 ? cols[notesIdx] : undefined,
    });
  }

  return { records, errors };
}

export function EnvironmentalUploadClient({
  initialRecords,
}: {
  initialRecords: RecordItem[];
}) {
  const [recordsList, setRecordsList] = useState<RecordItem[]>(initialRecords);
  const [uploadMode, setUploadMode] = useState<"single" | "csv">("single");

  // Single form state
  const [district, setDistrict] = useState("Gasabo");
  const [location, setLocation] = useState("");
  const [waterSource, setWaterSource] = useState("Municipal Piped Tap");
  const [waterContaminationLevel, setWaterContaminationLevel] = useState<
    "SAFE" | "MODERATE" | "HIGH" | "CRITICAL"
  >("HIGH");
  const [chlorineResidual, setChlorineResidual] = useState("0.08");
  const [sanitationScore, setSanitationScore] = useState("45");
  const [rainfallMm, setRainfallMm] = useState("35.0");
  const [temperature, setTemperature] = useState("26.5");
  const [turbidityNtu, setTurbidityNtu] = useState("12.0");
  const [phLevel, setPhLevel] = useState("7.2");
  const [floodRisk, setFloodRisk] = useState(true);
  const [notes, setNotes] = useState("");

  // CSV dataset upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedDataset, setParsedDataset] = useState<UploadEnvironmentalInput[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvIsParsing, setCsvIsParsing] = useState(false);

  // Status & transitions
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Records search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");

  const handleDownloadTemplate = () => {
    const sampleCsv = `district,location,waterSource,waterContaminationLevel,chlorineResidual,sanitationScore,rainfallMm,temperature,turbidityNtu,phLevel,floodRisk,notes
Gasabo,Nyabugogo River Basin,River / Stream Runoff,CRITICAL,0.02,28,45.2,26.8,18.5,7.2,true,Heavy runoff upstream; high turbidity
Kicukiro,Gahanga Community Tap,Municipal Piped Tap,SAFE,0.35,82,12.0,24.5,2.1,7.4,false,Routine chlorination check passed`;

    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "cholera_environmental_dataset_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSingleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    startTransition(async () => {
      try {
        const res = await uploadEnvironmentalData({
          district,
          location,
          waterSource,
          waterContaminationLevel,
          chlorineResidual: chlorineResidual ? parseFloat(chlorineResidual) : null,
          sanitationScore: sanitationScore ? parseFloat(sanitationScore) : null,
          rainfallMm: rainfallMm ? parseFloat(rainfallMm) : null,
          temperature: temperature ? parseFloat(temperature) : null,
          turbidityNtu: turbidityNtu ? parseFloat(turbidityNtu) : null,
          phLevel: phLevel ? parseFloat(phLevel) : null,
          floodRisk,
          notes,
        });

        const newRec: RecordItem = {
          id: res.id,
          district,
          location: location || null,
          waterSource,
          waterContaminationLevel,
          chlorineResidual: chlorineResidual ? parseFloat(chlorineResidual) : null,
          sanitationScore: sanitationScore ? parseFloat(sanitationScore) : null,
          rainfallMm: rainfallMm ? parseFloat(rainfallMm) : null,
          temperature: temperature ? parseFloat(temperature) : null,
          turbidityNtu: turbidityNtu ? parseFloat(turbidityNtu) : null,
          phLevel: phLevel ? parseFloat(phLevel) : null,
          floodRisk,
          outbreakRiskScore: res.riskScore,
          riskLevel: res.riskLevel,
          notes: notes || null,
          uploader: "You (Staff)",
          date: "Just now",
        };

        setRecordsList((prev) => [newRec, ...prev]);
        setStatusMsg({
          type: "success",
          text: `Environmental surveillance recorded successfully! Calculated Outbreak Risk: ${res.riskLevel} (${res.riskScore}%).`,
        });
        setLocation("");
        setNotes("");
      } catch (err) {
        setStatusMsg({
          type: "error",
          text: err instanceof Error ? err.message : "Upload failed.",
        });
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvIsParsing(true);
    setStatusMsg(null);

    try {
      const text = await file.text();
      const { records, errors } = parseCsvContent(text);
      setParsedDataset(records);
      setCsvErrors(errors);
      if (records.length === 0 && errors.length > 0) {
        setStatusMsg({ type: "error", text: errors[0] });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Failed to read CSV file content." });
    } finally {
      setCsvIsParsing(false);
    }
  };

  const handleBulkSubmit = () => {
    if (parsedDataset.length === 0) return;
    setStatusMsg(null);

    startTransition(async () => {
      try {
        const result = await bulkUploadEnvironmentalData(parsedDataset);
        setStatusMsg({
          type: "success",
          text: `Successfully uploaded ${result.importedCount} environmental surveillance records (${result.highRiskCount} high risk alerts detected).`,
        });

        // Prepend placeholder items to list for instant preview
        const formattedNew = parsedDataset.map((p, idx) => ({
          id: `bulk-${Date.now()}-${idx}`,
          district: p.district,
          location: p.location || null,
          waterSource: p.waterSource,
          waterContaminationLevel: p.waterContaminationLevel,
          chlorineResidual: p.chlorineResidual ?? null,
          sanitationScore: p.sanitationScore ?? null,
          rainfallMm: p.rainfallMm ?? null,
          temperature: p.temperature ?? null,
          turbidityNtu: p.turbidityNtu ?? null,
          phLevel: p.phLevel ?? null,
          floodRisk: Boolean(p.floodRisk),
          outbreakRiskScore:
            p.waterContaminationLevel === "CRITICAL"
              ? 85
              : p.waterContaminationLevel === "HIGH"
                ? 65
                : 30,
          riskLevel:
            p.waterContaminationLevel === "CRITICAL" ||
            p.waterContaminationLevel === "HIGH"
              ? "HIGH"
              : "MEDIUM",
          notes: p.notes || "Bulk CSV Dataset Import",
          uploader: "You (Staff)",
          date: "Just now",
        }));

        setRecordsList((prev) => [...formattedNew, ...prev]);
        setParsedDataset([]);
        setCsvFile(null);
      } catch (err) {
        setStatusMsg({
          type: "error",
          text: err instanceof Error ? err.message : "Bulk CSV upload failed.",
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this surveillance record?"))
      return;
    startTransition(async () => {
      await deleteEnvironmentalData(id);
      setRecordsList((prev) => prev.filter((r) => r.id !== id));
    });
  };

  const filteredRecords = useMemo(() => {
    return recordsList.filter((r) => {
      const matchesSearch =
        r.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.location &&
          r.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.waterSource.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk =
        riskFilter === "ALL" || r.riskLevel.toUpperCase() === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [recordsList, searchQuery, riskFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Environmental Surveillance
            </span>
            <span className="text-xs text-muted-foreground">
              · Water Quality & Telemetry Ingestion
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Upload Environmental Surveillance Data
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl leading-relaxed">
            Record bacterial water contamination levels, residual chlorine,
            rainfall spikes, and flood factors to power the ML outbreak
            prediction model.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="gap-1.5 text-xs"
          >
            <Download size={13} /> Sample CSV Template
          </Button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-xl max-w-md mb-6 border">
        <button
          type="button"
          onClick={() => {
            setUploadMode("single");
            setStatusMsg(null);
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors",
            uploadMode === "single"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <CloudRain size={14} /> Single Record Entry
        </button>
        <button
          type="button"
          onClick={() => {
            setUploadMode("csv");
            setStatusMsg(null);
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors",
            uploadMode === "csv"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <FileSpreadsheet size={14} /> Upload Dataset (CSV)
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Upload Forms */}
        <div className="lg:col-span-1">
          {uploadMode === "single" ? (
            /* Single Record Form */
            <form
              onSubmit={handleSingleUpload}
              className="rounded-xl border bg-card p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between font-semibold text-xs uppercase tracking-wider text-primary border-b pb-2">
                <span className="flex items-center gap-2">
                  <CloudRain size={16} /> New Environmental Record
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Manual Entry
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">District *</Label>
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
                <Label htmlFor="loc" className="text-xs">
                  Specific Location / Station
                </Label>
                <Input
                  id="loc"
                  placeholder="e.g. Nyabugogo Basin / Market Point"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Water Source Type</Label>
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

              <div className="space-y-1.5">
                <Label className="text-xs">
                  Bacterial Contamination Level *
                </Label>
                <select
                  value={waterContaminationLevel}
                  onChange={(e) =>
                    setWaterContaminationLevel(e.target.value as any)
                  }
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs font-semibold"
                >
                  <option value="CRITICAL">
                    CRITICAL (Fecal coliform high / Vibrio detected)
                  </option>
                  <option value="HIGH">HIGH (Untreated surface runoff)</option>
                  <option value="MODERATE">
                    MODERATE (Inadequate chlorine)
                  </option>
                  <option value="SAFE">
                    SAFE (Adequate chlorination / protected)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cl" className="text-xs">
                    Free Chlorine (mg/L)
                  </Label>
                  <Input
                    id="cl"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 0.15"
                    value={chlorineResidual}
                    onChange={(e) => setChlorineResidual(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="san" className="text-xs">
                    Sanitation Score (0-100)
                  </Label>
                  <Input
                    id="san"
                    type="number"
                    placeholder="e.g. 50"
                    value={sanitationScore}
                    onChange={(e) => setSanitationScore(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rain" className="text-xs">
                    Rainfall (mm/24h)
                  </Label>
                  <Input
                    id="rain"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 35.0"
                    value={rainfallMm}
                    onChange={(e) => setRainfallMm(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="temp" className="text-xs">
                    Temperature (°C)
                  </Label>
                  <Input
                    id="temp"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 26.5"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="flood"
                  checked={floodRisk}
                  onChange={(e) => setFloodRisk(e.target.checked)}
                  className="size-4 rounded border-border"
                />
                <Label htmlFor="flood" className="text-xs cursor-pointer">
                  Recent Flooding or Runoff Observed
                </Label>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="envNotes" className="text-xs">
                  Surveillance Field Notes
                </Label>
                <Textarea
                  id="envNotes"
                  rows={2}
                  placeholder="Field observations, rapid chlorination test kits used, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>

              {statusMsg && (
                <div
                  className={cn(
                    "text-xs p-3 rounded-lg border",
                    statusMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-800",
                  )}
                >
                  {statusMsg.text}
                </div>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="w-full gap-1.5"
              >
                {isPending ? (
                  <span className="size-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
                ) : (
                  <>
                    <PlusCircle size={15} /> Record Environmental Data
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* Bulk CSV Dataset Upload Mode */
            <div className="rounded-xl border bg-card p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between font-semibold text-xs uppercase tracking-wider text-primary border-b pb-2">
                <span className="flex items-center gap-2">
                  <FileSpreadsheet size={16} /> Bulk Dataset Ingestion
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  CSV Import
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload a structured CSV file containing environmental monitoring
                stations. Each record will be evaluated by the ML hazard engine.
              </p>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-muted/20">
                <UploadCloud
                  size={32}
                  className="mx-auto mb-2 text-muted-foreground/80"
                />
                <p className="text-xs font-semibold mb-1">
                  Choose or drag CSV dataset file
                </p>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Format: district, waterSource, waterContaminationLevel, chlorine...
                </p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <span className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-background hover:bg-muted text-xs font-medium shadow-xs transition-colors">
                    Browse CSV File
                  </span>
                </label>
              </div>

              {csvFile && (
                <div className="p-3 rounded-lg border bg-muted/30 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold truncate">
                      📄 {csvFile.name}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {(csvFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <Badge variant="outline" className="text-[10px]">
                      {parsedDataset.length} Records Parsed
                    </Badge>
                    {csvErrors.length > 0 && (
                      <Badge variant="destructive" className="text-[10px]">
                        {csvErrors.length} Issue(s)
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Status Message */}
              {statusMsg && (
                <div
                  className={cn(
                    "text-xs p-3 rounded-lg border",
                    statusMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-800",
                  )}
                >
                  {statusMsg.text}
                </div>
              )}

              {/* Submit Bulk Upload */}
              <Button
                type="button"
                onClick={handleBulkSubmit}
                disabled={isPending || parsedDataset.length === 0 || csvIsParsing}
                className="w-full gap-1.5"
              >
                {isPending ? (
                  <span className="size-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
                ) : (
                  <>
                    <UploadCloud size={15} /> Upload Dataset (
                    {parsedDataset.length} Records)
                  </>
                )}
              </Button>

              <div className="pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="w-full text-xs text-muted-foreground hover:text-primary gap-1.5"
                >
                  <Download size={13} /> Download Blank Dataset CSV Template
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Surveillance Table & CSV Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* If CSV Parsed and Pending Ingestion, Show Preview */}
          {parsedDataset.length > 0 && uploadMode === "csv" && (
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b bg-muted/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-xs font-semibold uppercase tracking-wider">
                    CSV Dataset Preview ({parsedDataset.length} rows ready)
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Showing first {Math.min(parsedDataset.length, 5)} records
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/20 text-muted-foreground border-b text-[11px]">
                    <tr>
                      <th className="p-2.5 font-medium">District</th>
                      <th className="p-2.5 font-medium">Location</th>
                      <th className="p-2.5 font-medium">Water Source</th>
                      <th className="p-2.5 font-medium">Contamination</th>
                      <th className="p-2.5 font-medium">Cl (mg/L)</th>
                      <th className="p-2.5 font-medium">Rain (mm)</th>
                      <th className="p-2.5 font-medium">Flood Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-[11px]">
                    {parsedDataset.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="p-2.5 font-semibold">{row.district}</td>
                        <td className="p-2.5 text-muted-foreground">
                          {row.location || "General"}
                        </td>
                        <td className="p-2.5">{row.waterSource}</td>
                        <td className="p-2.5">
                          <Badge
                            variant={
                              row.waterContaminationLevel === "CRITICAL"
                                ? "destructive"
                                : row.waterContaminationLevel === "HIGH"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-[9px]"
                          >
                            {row.waterContaminationLevel}
                          </Badge>
                        </td>
                        <td className="p-2.5">
                          {row.chlorineResidual ?? "N/A"}
                        </td>
                        <td className="p-2.5">{row.rainfallMm ?? "N/A"}</td>
                        <td className="p-2.5">
                          {row.floodRisk ? "Yes (Flooding)" : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active Environmental Surveillance Points Table */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Active Environmental Surveillance Points ({recordsList.length})
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Live data feeding the cholera outbreak machine learning model
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder="Search district or source..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-7 text-xs w-44"
                  />
                </div>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value as any)}
                  className="h-8 rounded-md border bg-background px-2 text-xs"
                >
                  <option value="ALL">All Risk Tiers</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="SAFE">Safe / Low</option>
                </select>
              </div>
            </div>

            <div className="divide-y max-h-[720px] overflow-y-auto">
              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No surveillance points matching search or filter criteria.
                </div>
              ) : (
                filteredRecords.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-muted/30 transition-colors text-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm">{r.district}</span>
                        {r.location && (
                          <span className="text-muted-foreground">
                            ({r.location})
                          </span>
                        )}
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
                          {r.riskLevel} RISK ({r.outbreakRiskScore}%)
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {r.waterContaminationLevel}
                        </Badge>
                        {r.floodRisk && (
                          <Badge
                            variant="destructive"
                            className="text-[9px] bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-300"
                          >
                            Flood Hazard
                          </Badge>
                        )}
                      </div>

                      <p className="text-muted-foreground">
                        Source: <strong>{r.waterSource}</strong> · Cl:{" "}
                        {r.chlorineResidual !== null
                          ? `${r.chlorineResidual} mg/L`
                          : "N/A"}{" "}
                        · Rain:{" "}
                        {r.rainfallMm !== null ? `${r.rainfallMm} mm` : "N/A"} ·
                        Temp:{" "}
                        {r.temperature !== null
                          ? `${r.temperature}°C`
                          : "N/A"}
                      </p>

                      {r.notes && (
                        <p className="italic text-muted-foreground/80 bg-muted/40 p-2 rounded text-[11px]">
                          &quot;{r.notes}&quot;
                        </p>
                      )}

                      <p className="text-[11px] text-muted-foreground/60">
                        Logged by {r.uploader} on {r.date}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleDelete(r.id)}
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      title="Delete record"
                    >
                      <Trash2 size={13} />
                    </Button>
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
