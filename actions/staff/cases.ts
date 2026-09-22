"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { requireStaffAction } from "@/lib/staff-auth";
import {
  classifyCholeraRisk,
  getCholeraRiskRecommendation,
  streamCholeraAssessment,
} from "@/lib/ai";

export type SubmitDiseaseCaseInput = {
  patientName: string;
  patientAge: number;
  patientGender: string;
  district: string;
  waterSource: string;
  stoolType: string;
  dehydrationLevel: "NONE" | "SOME" | "SEVERE";
  symptoms: string[];
  clinicalNotes?: string;
  treatmentInitiated?: string;
};

export async function submitDiseaseCase(input: SubmitDiseaseCaseInput) {
  const session = await requireStaffAction();
  const requestHeaders = await headers();

  const patientName = input.patientName.trim();
  if (!patientName) throw new Error("Patient name is required.");

  const symptoms = input.symptoms.filter(Boolean);
  if (symptoms.length === 0) {
    throw new Error("Select at least one clinical sign/symptom.");
  }

  const promptText = `
    Clinical Case Submission:
    Patient Name: ${patientName}
    Age: ${input.patientAge}, Gender: ${input.patientGender}
    District: ${input.district}
    Water Source: ${input.waterSource}
    Stool Appearance: ${input.stoolType}
    Assessed Dehydration Level: ${input.dehydrationLevel}
    Clinical Symptoms: ${symptoms.join(", ")}
    Clinical/Staff Notes: ${input.clinicalNotes || "None"}
    Treatment: ${input.treatmentInitiated || "Standard rehydration"}
  `.trim();

  // Run AI triage
  const [classificationResult, aiStreamResult] = await Promise.all([
    classifyCholeraRisk(promptText, input.district, input.waterSource),
    (async () => {
      try {
        const stream = await streamCholeraAssessment({
          symptoms: promptText,
          district: input.district,
          waterSource: input.waterSource,
          patientAge: input.patientAge,
          patientGender: input.patientGender,
        });
        let text = "";
        for await (const chunk of stream) text += chunk;
        return text;
      } catch {
        return "Clinical cholera case validated by attending staff. Prompt IV/ORS hydration and epidemiological reporting indicated.";
      }
    })(),
  ]);

  const riskLevel =
    input.dehydrationLevel === "SEVERE"
      ? "HIGH"
      : input.dehydrationLevel === "SOME"
        ? "MEDIUM"
        : classificationResult.riskLevel;

  const recommendation =
    classificationResult.recommendation ||
    getCholeraRiskRecommendation(riskLevel).message;

  const record = await prisma.assessment.create({
    data: {
      userId: session.user.id,
      patientName,
      patientAge: input.patientAge,
      patientGender: input.patientGender,
      district: input.district,
      waterSource: input.waterSource,
      stoolType: input.stoolType,
      dehydrationLevel: input.dehydrationLevel,
      caseType: "CLINICAL_CASE",
      validationStatus: "VALIDATED",
      validatedById: session.user.id,
      validatedAt: new Date(),
      validationNotes: input.clinicalNotes || "Clinically confirmed case by healthcare staff.",
      symptoms,
      symptomsText: input.clinicalNotes || null,
      riskLevel,
      confidenceScore: classificationResult.confidenceScore || 0.95,
      detectedSymptoms: classificationResult.detectedSymptoms.length > 0 ? classificationResult.detectedSymptoms : symptoms,
      fastScore: classificationResult.fastScore,
      choleraRiskScore: classificationResult.choleraRiskScore,
      requiresEmergency: riskLevel === "HIGH",
      aiResponse: aiStreamResult,
      recommendation,
      status: "REVIEWED",
      reviewedByStaff: true,
      reviewedAt: new Date(),
      ipAddress: requestHeaders.get("x-forwarded-for"),
      userAgent: requestHeaders.get("user-agent"),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DISEASE_CASE_CREATED",
      entity: "Assessment",
      entityId: record.id,
      description: `Staff member ${session.user.name} submitted and validated a clinical cholera case for ${patientName} in ${input.district}.`,
      metadata: {
        district: input.district,
        dehydrationLevel: input.dehydrationLevel,
        riskLevel,
        patientAge: input.patientAge,
      },
      ipAddress: requestHeaders.get("x-forwarded-for"),
      userAgent: requestHeaders.get("user-agent"),
    },
  });

  revalidatePath("/staff");
  revalidatePath("/staff/cases");
  revalidatePath("/staff/trends");
  revalidatePath("/admin/records");

  return { caseId: record.id };
}
