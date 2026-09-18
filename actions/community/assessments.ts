"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import {
  classifyCholeraRisk,
  getCholeraRiskRecommendation,
  streamCholeraAssessment,
  choleraSymptomLabels,
  type CholeraRiskAssessmentResult,
} from "@/lib/ai";
import { sendAssessmentResultEmail, sendDoctorAlertEmail } from "@/lib/brevo";
import { assertAiAssessmentAvailable } from "@/lib/ai-limits";
import { requireCommunityAction } from "@/lib/community-auth";

export type CreateCommunityAssessmentInput = {
  symptoms: string[];
  symptomsText?: string;
  district?: string;
  waterSource?: string;
  stoolType?: string;
  patientAge?: number;
  patientGender?: string;
};

const fallbackClassification: CholeraRiskAssessmentResult = {
  riskLevel: "MEDIUM",
  confidenceScore: 0.6,
  detectedSymptoms: ["Watery diarrhea"],
  dehydrationLevel: "SOME",
  choleraRiskScore: 5,
  fastScore: 2,
  requiresEmergency: false,
  recommendation:
    "Start Oral Rehydration Salts (ORS) immediately and visit the nearest health clinic today.",
};

function normalizeConfidence(score: number) {
  if (!Number.isFinite(score)) return 0.5;
  return score > 1 ? Math.min(score / 100, 1) : Math.max(score, 0);
}

function buildSymptomsText(input: CreateCommunityAssessmentInput) {
  const selected = input.symptoms
    .map((symptom) => choleraSymptomLabels[symptom] ?? symptom)
    .join(", ");

  return [
    selected ? `Selected symptoms: ${selected}` : "",
    input.district ? `District / Hotspot: ${input.district}` : "",
    input.waterSource
      ? `Primary drinking water source: ${input.waterSource}`
      : "",
    input.stoolType ? `Stool appearance: ${input.stoolType}` : "",
    input.symptomsText?.trim()
      ? `Community description: ${input.symptomsText.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function runFullAssessment(input: {
  symptoms: string;
  district?: string;
  waterSource?: string;
  patientAge?: number;
  patientGender?: string;
}) {
  const startedAt = Date.now();

  try {
    const stream = await streamCholeraAssessment({
      symptoms: input.symptoms,
      district: input.district,
      waterSource: input.waterSource,
      patientAge: input.patientAge,
      patientGender: input.patientGender,
    });
    let text = "";

    for await (const chunk of stream) {
      text += chunk;
    }

    return {
      text,
      latencyMs: Date.now() - startedAt,
      status: "SUCCESS" as const,
      errorMessage: null,
    };
  } catch (error) {
    return {
      text: "The AI outbreak prediction assessment could not be fully streamed. Based on reported symptoms, immediately initiate Oral Rehydration Salts (ORS) solution and proceed to the nearest health facility for clinical evaluation.",
      latencyMs: Date.now() - startedAt,
      status: "FAILED" as const,
      errorMessage: error instanceof Error ? error.message : "Unknown AI error",
    };
  }
}

async function runClassification(
  symptoms: string,
  district?: string,
  waterSource?: string,
) {
  const startedAt = Date.now();

  try {
    const result = await classifyCholeraRisk(symptoms, district, waterSource);

    return {
      result,
      latencyMs: Date.now() - startedAt,
      status: "SUCCESS" as const,
      errorMessage: null,
    };
  } catch (error) {
    return {
      result: fallbackClassification,
      latencyMs: Date.now() - startedAt,
      status: "FAILED" as const,
      errorMessage: error instanceof Error ? error.message : "Unknown AI error",
    };
  }
}

export async function createCommunityAssessment(
  input: CreateCommunityAssessmentInput,
) {
  const session = await requireCommunityAction();

  await assertAiAssessmentAvailable(session.user.id);

  const symptoms = input.symptoms.filter(Boolean);
  const symptomsText = input.symptomsText?.trim() ?? "";
  const district = input.district?.trim() || "Gasabo";
  const waterSource = input.waterSource?.trim() || "Municipal Tap";
  const stoolType = input.stoolType?.trim() || "Watery";

  if (symptoms.length === 0 && symptomsText.length === 0) {
    throw new Error(
      "Please select at least one symptom or describe what you are experiencing.",
    );
  }

  const requestHeaders = await headers();
  const prompt = buildSymptomsText({
    symptoms,
    symptomsText,
    district,
    waterSource,
    stoolType,
  });

  const [assessmentResult, classificationResult] = await Promise.all([
    runFullAssessment({
      symptoms: prompt,
      district,
      waterSource,
      patientAge: input.patientAge,
      patientGender: input.patientGender,
    }),
    runClassification(prompt, district, waterSource),
  ]);

  const classification = classificationResult.result;
  const confidenceScore = normalizeConfidence(classification.confidenceScore);
  const recommendation =
    classification.recommendation ||
    getCholeraRiskRecommendation(classification.riskLevel).message;

  const assessment = await prisma.assessment.create({
    data: {
      userId: session.user.id,
      patientName: session.user.name,
      district,
      waterSource,
      stoolType,
      dehydrationLevel: classification.dehydrationLevel,
      caseType: "COMMUNITY_REPORT",
      validationStatus: "PENDING",
      symptoms,
      symptomsText: symptomsText || null,
      riskLevel: classification.riskLevel,
      confidenceScore,
      detectedSymptoms: classification.detectedSymptoms,
      fastScore: classification.fastScore,
      choleraRiskScore: classification.choleraRiskScore,
      requiresEmergency: classification.requiresEmergency,
      aiResponse: assessmentResult.text,
      recommendation,
      status: classification.riskLevel === "HIGH" ? "FLAGGED" : "COMPLETED",
      ipAddress: requestHeaders.get("x-forwarded-for"),
      userAgent: requestHeaders.get("user-agent"),
    },
  });

  await prisma.$transaction([
    prisma.aiUsageLog.create({
      data: {
        userId: session.user.id,
        assessmentId: assessment.id,
        model: "LLAMA_3_3_70B",
        callType: "STREAM_ASSESSMENT",
        status: assessmentResult.status,
        latencyMs: assessmentResult.latencyMs,
        errorMessage: assessmentResult.errorMessage,
      },
    }),
    prisma.aiUsageLog.create({
      data: {
        userId: session.user.id,
        assessmentId: assessment.id,
        model: "LLAMA_3_1_8B",
        callType: "RISK_CLASSIFICATION",
        status: classificationResult.status,
        latencyMs: classificationResult.latencyMs,
        errorMessage: classificationResult.errorMessage,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ASSESSMENT_CREATED",
        entity: "Assessment",
        entityId: assessment.id,
        description: `Community user submitted a ${classification.riskLevel.toLowerCase()} cholera risk report for district ${district}.`,
        metadata: {
          riskLevel: classification.riskLevel,
          confidenceScore,
          dehydrationLevel: classification.dehydrationLevel,
          district,
          waterSource,
        },
        ipAddress: requestHeaders.get("x-forwarded-for"),
        userAgent: requestHeaders.get("user-agent"),
      },
    }),
    prisma.notification.create({
      data: {
        userId: session.user.id,
        assessmentId: assessment.id,
        type: "ASSESSMENT_RESULT",
        title: "Cholera risk assessment complete",
        message: `Your assessment result is ${classification.riskLevel.toLowerCase()} risk with ${Math.round(confidenceScore * 100)}% confidence. Dehydration level: ${classification.dehydrationLevel}.`,
      },
    }),
    ...(classification.riskLevel === "HIGH"
      ? [
          prisma.notification.create({
            data: {
              userId: session.user.id,
              assessmentId: assessment.id,
              type: "HIGH_RISK_ALERT" as const,
              title: "High cholera outbreak risk detected",
              message:
                "Severe dehydration or cholera signs detected. Proceed immediately to the nearest Cholera Treatment Center and begin ORS rehydration continuously.",
            },
          }),
        ]
      : []),
  ]);

  if (classification.riskLevel === "HIGH") {
    await Promise.all([
      sendDoctorAlertEmail({
        patientName: session.user.name,
        assessmentId: assessment.id,
        riskLevel: classification.riskLevel,
        confidenceScore,
        district,
      }),
      sendAssessmentResultEmail({
        to: session.user.email,
        patientName: session.user.name,
        riskLevel: classification.riskLevel,
        confidenceScore,
        recommendation,
      }),
    ]);
  }

  revalidatePath("/community");
  revalidatePath("/community/notifications");
  revalidatePath(`/community/symptoms/${assessment.id}`);
  revalidatePath(`/community/assessment/${assessment.id}`);
  revalidatePath("/doctor");
  revalidatePath("/doctor/validate");
  revalidatePath("/admin/records");

  return { assessmentId: assessment.id };
}

// Backward compatibility alias
export async function createAssessment(input: {
  symptoms: string[];
  symptomsText?: string;
}) {
  return createCommunityAssessment(input);
}
