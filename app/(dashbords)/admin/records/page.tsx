import { AdminPageHeader } from "@/components/admin-page-header";
import { requireAdminPage } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { AdminRecordsClient } from "@/components/admin-records-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileDown } from "lucide-react";

export default async function AdminRecordsPage() {
  await requireAdminPage();

  const records = await prisma.assessment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const formatted = records.map((r) => ({
    id: r.id,
    patientName: r.patientName || r.user?.name || "Anonymous",
    patientAge: r.patientAge,
    patientGender: r.patientGender,
    district: r.district || "Gasabo",
    waterSource: r.waterSource || "Tap",
    stoolType: r.stoolType || "Watery",
    dehydrationLevel: r.dehydrationLevel || "SOME",
    riskLevel: r.riskLevel,
    confidenceScore: Math.round(r.confidenceScore * 100),
    validationStatus: r.validationStatus,
    caseType: r.caseType ?? "FIELD_REPORT",
    symptomsText: r.symptomsText,
    validationNotes: r.validationNotes,
    reporterEmail: r.user?.email || "Unknown",
    date: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(r.createdAt),
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <AdminPageHeader
          eyebrow="Registry Management"
          title="Manage Disease Records"
          description="Oversight of all clinically reported and field-submitted cholera disease cases."
        />
        <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0 text-xs">
          <Link href="/admin/reports">
            <FileDown size={13} /> Export Records
          </Link>
        </Button>
      </div>

      <AdminRecordsClient initialRecords={formatted} />
    </div>
  );
}
