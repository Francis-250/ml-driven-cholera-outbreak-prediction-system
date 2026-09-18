import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  Filter,
  MapPin,
  PlusCircle,
  Search,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireDoctorPage } from "@/lib/doctor-auth";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function DoctorCasesPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string; status?: string }>;
}) {
  await requireDoctorPage();
  const params = await searchParams;

  const whereClause: any = {};
  if (params.district) whereClause.district = params.district;
  if (params.status) whereClause.validationStatus = params.status;

  const cases = await prisma.assessment.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const districts = [
    "Gasabo",
    "Kicukiro",
    "Nyarugenge",
    "Rubavu",
    "Rusizi",
    "Gatsibo",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Epidemiological Registry
            </span>
            <span className="text-xs text-muted-foreground">· Disease Case Surveillance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Registered Cholera Disease Cases
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview of clinically confirmed cases, community reports, and dehydration severity records.
          </p>
        </div>

        <Button asChild className="gap-1.5 shrink-0">
          <Link href="/doctor/cases/new">
            <PlusCircle size={15} /> Submit New Case
          </Link>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl border bg-card text-xs">
        <span className="text-muted-foreground font-medium flex items-center gap-1">
          <Filter size={13} /> Filter by District:
        </span>
        <Link
          href="/doctor/cases"
          className={cn(
            "px-2.5 py-1 rounded-md transition-colors",
            !params.district ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted",
          )}
        >
          All
        </Link>
        {districts.map((d) => (
          <Link
            key={d}
            href={`/doctor/cases?district=${d}`}
            className={cn(
              "px-2.5 py-1 rounded-md transition-colors",
              params.district === d ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted",
            )}
          >
            {d}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Showing {cases.length} Disease Cases
          </p>
        </div>

        <div className="divide-y">
          {cases.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No disease cases found matching the criteria.
            </div>
          ) : (
            cases.map((c) => (
              <div
                key={c.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold">
                      {c.patientName || c.user?.name || "Anonymous Patient"}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      <MapPin size={9} className="mr-0.5" /> {c.district || "Gasabo"}
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
                      {c.riskLevel} RISK
                    </Badge>
                    <Badge
                      variant={
                        c.validationStatus === "VALIDATED"
                          ? "default"
                          : c.validationStatus === "REJECTED"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {c.validationStatus}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      ({c.caseType ?? "COMMUNITY_REPORT"})
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Age: {c.patientAge ?? "N/A"} · Gender: {c.patientGender ?? "N/A"} · Water: {c.waterSource || "Tap"} · Dehydration: <strong>{c.dehydrationLevel || "SOME"}</strong>
                  </p>

                  {c.symptomsText && (
                    <p className="text-[11px] text-muted-foreground italic line-clamp-1">
                      &quot;{c.symptomsText}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <span className="text-muted-foreground">{formatDate(c.createdAt)}</span>
                  {c.validationStatus === "PENDING" && (
                    <Button asChild size="xs" variant="default">
                      <Link href="/doctor/validate">Validate</Link>
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
