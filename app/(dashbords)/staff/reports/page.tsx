import { requireStaffPage } from "@/lib/staff-auth";
import prisma from "@/lib/prisma";
import { StaffReportsClient } from "@/components/staff-reports-client";

export default async function StaffReportsPage() {
  await requireStaffPage();

  const [cases, environmental] = await Promise.all([
    prisma.assessment.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.environmentalData.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const formattedCases = cases.map((c) => ({
    id: c.id,
    patientName: c.patientName || c.user.name,
    age: c.patientAge,
    gender: c.patientGender,
    district: c.district || "Gasabo",
    waterSource: c.waterSource || "Tap",
    stoolType: c.stoolType || "Watery",
    dehydrationLevel: c.dehydrationLevel || "SOME",
    riskLevel: c.riskLevel,
    confidenceScore: Math.round(c.confidenceScore * 100),
    validationStatus: c.validationStatus,
    caseType: c.caseType || "CLINICAL_CASE",
    createdAtIso: c.createdAt.toISOString(),
    date: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(c.createdAt),
  }));

  const formattedEnv = environmental.map((e) => ({
    id: e.id,
    district: e.district,
    location: e.location,
    waterSource: e.waterSource,
    waterContaminationLevel: e.waterContaminationLevel,
    chlorineResidual: e.chlorineResidual,
    sanitationScore: e.sanitationScore,
    rainfallMm: e.rainfallMm,
    outbreakRiskScore: e.outbreakRiskScore,
    riskLevel: e.riskLevel,
    date: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(e.createdAt),
  }));

  return (
    <StaffReportsClient
      cases={formattedCases}
      environmental={formattedEnv}
    />
  );
}
