"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { requireDoctorAction } from "@/lib/doctor-auth";
import { calculateEnvironmentalOutbreakRisk } from "@/lib/ai";

export type UploadEnvironmentalInput = {
  district: string;
  location?: string;
  waterSource: string;
  waterContaminationLevel: "SAFE" | "MODERATE" | "HIGH" | "CRITICAL";
  chlorineResidual?: number | null;
  sanitationScore?: number | null;
  rainfallMm?: number | null;
  temperature?: number | null;
  turbidityNtu?: number | null;
  phLevel?: number | null;
  floodRisk?: boolean;
  notes?: string;
};

export async function uploadEnvironmentalData(input: UploadEnvironmentalInput) {
  const session = await requireDoctorAction();
  const requestHeaders = await headers();

  const district = input.district.trim();
  if (!district) throw new Error("District is required.");

  const waterSource = input.waterSource.trim();
  if (!waterSource) throw new Error("Water source type is required.");

  // Calculate ML outbreak risk score from environmental parameters
  const riskCalculation = calculateEnvironmentalOutbreakRisk({
    waterContaminationLevel: input.waterContaminationLevel,
    chlorineResidual: input.chlorineResidual,
    sanitationScore: input.sanitationScore,
    rainfallMm: input.rainfallMm,
    floodRisk: input.floodRisk,
  });

  const record = await prisma.environmentalData.create({
    data: {
      district,
      location: input.location?.trim() || null,
      waterSource,
      waterContaminationLevel: input.waterContaminationLevel,
      chlorineResidual: input.chlorineResidual ?? null,
      sanitationScore: input.sanitationScore ?? null,
      rainfallMm: input.rainfallMm ?? null,
      temperature: input.temperature ?? null,
      turbidityNtu: input.turbidityNtu ?? null,
      phLevel: input.phLevel ?? null,
      floodRisk: Boolean(input.floodRisk),
      outbreakRiskScore: riskCalculation.riskScore,
      riskLevel: riskCalculation.riskLevel,
      notes: input.notes?.trim() || null,
      uploadedByUserId: session.user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ENVIRONMENTAL_DATA_UPLOADED",
      entity: "EnvironmentalData",
      entityId: record.id,
      description: `Doctor ${session.user.name} uploaded environmental surveillance data for ${district} (Risk: ${riskCalculation.riskLevel}, Score: ${riskCalculation.riskScore}%).`,
      metadata: {
        district,
        waterSource,
        waterContaminationLevel: input.waterContaminationLevel,
        outbreakRiskScore: riskCalculation.riskScore,
      },
      ipAddress: requestHeaders.get("x-forwarded-for"),
      userAgent: requestHeaders.get("user-agent"),
    },
  });

  revalidatePath("/doctor");
  revalidatePath("/doctor/environmental");
  revalidatePath("/doctor/predictions");
  revalidatePath("/doctor/trends");
  revalidatePath("/community");
  revalidatePath("/community/hotspots");
  revalidatePath("/admin");

  return { id: record.id, riskScore: riskCalculation.riskScore, riskLevel: riskCalculation.riskLevel };
}

export async function bulkUploadEnvironmentalData(records: UploadEnvironmentalInput[]) {
  const session = await requireDoctorAction();
  const requestHeaders = await headers();

  if (!records || records.length === 0) {
    throw new Error("No valid records found in the uploaded dataset.");
  }

  if (records.length > 500) {
    throw new Error("Maximum batch upload limit is 500 records per CSV.");
  }

  const validLevels = new Set(["SAFE", "MODERATE", "HIGH", "CRITICAL"]);

  const dataToInsert = records.map((r, index) => {
    const district = r.district?.trim();
    if (!district) throw new Error(`Row ${index + 1}: District is required.`);

    const waterSource = r.waterSource?.trim() || "Protected Source";
    const rawLevel = (r.waterContaminationLevel?.toString()?.toUpperCase() || "MODERATE") as "SAFE" | "MODERATE" | "HIGH" | "CRITICAL";
    const waterContaminationLevel = validLevels.has(rawLevel) ? rawLevel : "MODERATE";

    const risk = calculateEnvironmentalOutbreakRisk({
      waterContaminationLevel,
      chlorineResidual: r.chlorineResidual ?? null,
      sanitationScore: r.sanitationScore ?? null,
      rainfallMm: r.rainfallMm ?? null,
      floodRisk: Boolean(r.floodRisk),
    });

    return {
      district,
      location: r.location?.trim() || null,
      waterSource,
      waterContaminationLevel,
      chlorineResidual: r.chlorineResidual ?? null,
      sanitationScore: r.sanitationScore ?? null,
      rainfallMm: r.rainfallMm ?? null,
      temperature: r.temperature ?? null,
      turbidityNtu: r.turbidityNtu ?? null,
      phLevel: r.phLevel ?? null,
      floodRisk: Boolean(r.floodRisk),
      outbreakRiskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      notes: r.notes?.trim() || "Bulk CSV Dataset Import",
      uploadedByUserId: session.user.id,
    };
  });

  await prisma.environmentalData.createMany({
    data: dataToInsert,
  });

  const highRiskCount = dataToInsert.filter((d) => d.riskLevel === "HIGH").length;

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ENVIRONMENTAL_DATA_UPLOADED",
      entity: "EnvironmentalData",
      entityId: "bulk-csv-upload",
      description: `Doctor ${session.user.name} bulk imported ${dataToInsert.length} environmental surveillance records via CSV dataset (${highRiskCount} high risk).`,
      metadata: {
        totalImported: dataToInsert.length,
        highRiskCount,
      },
      ipAddress: requestHeaders.get("x-forwarded-for"),
      userAgent: requestHeaders.get("user-agent"),
    },
  });

  revalidatePath("/doctor");
  revalidatePath("/doctor/environmental");
  revalidatePath("/doctor/predictions");
  revalidatePath("/doctor/trends");
  revalidatePath("/community");
  revalidatePath("/community/hotspots");
  revalidatePath("/admin");

  return {
    importedCount: dataToInsert.length,
    highRiskCount,
  };
}

export async function deleteEnvironmentalData(id: string) {
  await requireDoctorAction();
  await prisma.environmentalData.delete({ where: { id } });
  revalidatePath("/doctor/environmental");
}
