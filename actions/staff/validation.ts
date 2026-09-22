"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { requireStaffAction } from "@/lib/staff-auth";

export type ValidateRecordInput = {
  recordId: string;
  decision: "VALIDATED" | "REJECTED";
  validationNotes?: string;
  confirmedRiskLevel?: "LOW" | "MEDIUM" | "HIGH";
  confirmedDehydrationLevel?: "NONE" | "SOME" | "SEVERE";
};

export async function validateDiseaseRecord(input: ValidateRecordInput) {
  const session = await requireStaffAction();
  const requestHeaders = await headers();

  const record = await prisma.assessment.findUnique({
    where: { id: input.recordId },
    select: { id: true, userId: true, patientName: true, district: true },
  });

  if (!record) throw new Error("Disease record not found.");

  const updateData: {
    validationStatus: "VALIDATED" | "REJECTED";
    validatedById: string;
    validatedAt: Date;
    validationNotes: string | null;
    reviewedByDoctor: boolean;
    reviewedAt: Date;
    status: "REVIEWED";
    riskLevel?: "LOW" | "MEDIUM" | "HIGH";
    dehydrationLevel?: "NONE" | "SOME" | "SEVERE";
  } = {
    validationStatus: input.decision,
    validatedById: session.user.id,
    validatedAt: new Date(),
    validationNotes: input.validationNotes?.trim() || (input.decision === "VALIDATED" ? "Validated by staff." : "Case dismissed following clinical review."),
    reviewedByDoctor: true,
    reviewedAt: new Date(),
    status: "REVIEWED",
  };

  if (input.confirmedRiskLevel) {
    updateData.riskLevel = input.confirmedRiskLevel;
  }
  if (input.confirmedDehydrationLevel) {
    updateData.dehydrationLevel = input.confirmedDehydrationLevel;
  }

  await prisma.assessment.update({
    where: { id: input.recordId },
    data: updateData,
  });

  // Notify the reporting user
  await prisma.notification.create({
    data: {
      userId: record.userId,
      assessmentId: record.id,
      type: "DOCTOR_ALERT",
      title: input.decision === "VALIDATED" ? "Case validated by healthcare staff" : "Case review completed",
      message: `Staff member ${session.user.name} has ${input.decision.toLowerCase()} the cholera symptom report: ${input.validationNotes || "Review complete."}`,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DISEASE_CASE_VALIDATED",
      entity: "Assessment",
      entityId: record.id,
      description: `Staff member ${session.user.name} marked disease case #${record.id.slice(0, 8)} as ${input.decision} (${record.district}).`,
      metadata: {
        decision: input.decision,
        validationNotes: input.validationNotes,
      },
      ipAddress: requestHeaders.get("x-forwarded-for"),
      userAgent: requestHeaders.get("user-agent"),
    },
  });

  revalidatePath("/staff");
  revalidatePath("/staff/validate");
  revalidatePath("/staff/cases");
  revalidatePath("/staff/trends");
  revalidatePath("/doctor");
  revalidatePath("/admin/records");
}
