import { requireStaffPage } from "@/lib/staff-auth";
import prisma from "@/lib/prisma";
import { DoctorReportsClient } from "@/components/doctor-reports-client";

export default async function StaffReportsPage() {
  await requireStaffPage();

  const [cases, environmental] = await Promise.all([
    prisma.assessment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.environmentalData.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: { select: { name: true } },
      },
    }),
  ]);

  const formattedCases = cases.map((c) => ({
    id: c.id,
    patientName: c.patientName || c.user?.name || "Patient",
    age: c.patientAge,
    gender: c.patientGender,
    district: c.district || "Gasabo",
    waterSource: c.waterSource || "Tap",
    stoolType: c.stoolType || "Watery",
    dehydrationLevel: c.dehydrationLevel || "SOME",
    riskLevel: c.riskLevel,
    confidenceScore: Math.round(c.confidenceScore * 100),
    validationStatus: c.validationStatus,
    caseType: c.caseType ?? "CLINICAL_CASE",
    date: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(c.createdAt),
    createdAtIso: c.createdAt.toISOString(),
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
    <DoctorReportsClient
      cases={formattedCases}
      environmental={formattedEnv}
    />
  );
}
