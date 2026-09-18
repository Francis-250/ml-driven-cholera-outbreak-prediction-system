import { requireDoctorPage } from "@/lib/doctor-auth";
import prisma from "@/lib/prisma";
import { DoctorValidationClient } from "@/components/doctor-validation-client";

export default async function DoctorValidatePage() {
  await requireDoctorPage();

  const pendingRecords = await prisma.assessment.findMany({
    where: { validationStatus: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const validatedRecently = await prisma.assessment.findMany({
    where: { validationStatus: { not: "PENDING" } },
    orderBy: { validatedAt: "desc" },
    take: 8,
    include: {
      user: { select: { name: true } },
    },
  });

  const formattedPending = pendingRecords.map((r) => ({
    id: r.id,
    patientName: r.patientName || r.user.name,
    district: r.district || "Gasabo",
    waterSource: r.waterSource || "Tap",
    stoolType: r.stoolType || "Watery",
    dehydrationLevel: r.dehydrationLevel || "SOME",
    riskLevel: r.riskLevel,
    confidenceScore: Math.round(r.confidenceScore * 100),
    choleraRiskScore: r.choleraRiskScore,
    symptoms: Array.isArray(r.detectedSymptoms) ? (r.detectedSymptoms as string[]) : [],
    symptomsText: r.symptomsText,
    aiResponse: r.aiResponse,
    date: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(r.createdAt),
  }));

  const formattedRecent = validatedRecently.map((r) => ({
    id: r.id,
    patientName: r.patientName || r.user.name,
    district: r.district || "Gasabo",
    validationStatus: r.validationStatus,
    riskLevel: r.riskLevel,
    validationNotes: r.validationNotes,
    date: r.validatedAt
      ? new Intl.DateTimeFormat("en", {
          month: "short",
          day: "numeric",
        }).format(r.validatedAt)
      : "Recently",
  }));

  return (
    <DoctorValidationClient
      pendingRecords={formattedPending}
      recentValidated={formattedRecent}
    />
  );
}
