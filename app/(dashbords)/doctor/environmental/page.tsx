import { requireDoctorPage } from "@/lib/doctor-auth";
import prisma from "@/lib/prisma";
import { EnvironmentalUploadClient } from "@/components/doctor-environmental-client";

export default async function DoctorEnvironmentalPage() {
  await requireDoctorPage();

  const records = await prisma.environmentalData.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { name: true } },
    },
  });

  const formatted = records.map((r) => ({
    id: r.id,
    district: r.district,
    location: r.location,
    waterSource: r.waterSource,
    waterContaminationLevel: r.waterContaminationLevel,
    chlorineResidual: r.chlorineResidual,
    sanitationScore: r.sanitationScore,
    rainfallMm: r.rainfallMm,
    temperature: r.temperature,
    turbidityNtu: r.turbidityNtu,
    phLevel: r.phLevel,
    floodRisk: r.floodRisk,
    outbreakRiskScore: r.outbreakRiskScore,
    riskLevel: r.riskLevel,
    notes: r.notes,
    uploader: r.uploadedBy?.name || "Clinician",
    date: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(r.createdAt),
  }));

  return <EnvironmentalUploadClient initialRecords={formatted} />;
}
