import { AdminPageHeader } from "@/components/admin-page-header";
import { requireAdminPage } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { AdminReportsClient } from "@/components/admin-reports-client";

export default async function AdminReportsPage() {
  await requireAdminPage();

  const [caseCount, environmentalCount, auditLogCount] = await Promise.all([
    prisma.assessment.count(),
    prisma.environmentalData.count(),
    prisma.auditLog.count(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <AdminPageHeader
        eyebrow="Data Governance"
        title="Export Epidemiological Reports"
        description="Generate and download authoritative surveillance datasets, water contamination records, and compliance audit logs."
      />

      <AdminReportsClient
        caseCount={caseCount}
        environmentalCount={environmentalCount}
        auditLogCount={auditLogCount}
      />
    </div>
  );
}
