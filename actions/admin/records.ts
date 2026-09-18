"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdminAction } from "@/lib/admin-auth";

export async function deleteDiseaseRecord(recordId: string) {
  const session = await requireAdminAction();

  const record = await prisma.assessment.findUnique({
    where: { id: recordId },
    select: { id: true, district: true, patientName: true },
  });

  if (!record) throw new Error("Record not found.");

  await prisma.assessment.delete({
    where: { id: recordId },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ASSESSMENT_DELETED",
      entity: "Assessment",
      entityId: recordId,
      description: `Administrator ${session.user.name} deleted disease record #${recordId.slice(0, 8)} (${record.district}).`,
      metadata: { district: record.district, patientName: record.patientName },
    },
  });

  revalidatePath("/admin/records");
  revalidatePath("/admin/assessments");
  revalidatePath("/admin");
}

export async function updateDiseaseRecord(input: {
  recordId: string;
  district?: string;
  waterSource?: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  validationStatus?: "PENDING" | "VALIDATED" | "REJECTED";
  dehydrationLevel?: "NONE" | "SOME" | "SEVERE";
  validationNotes?: string;
}) {
  const session = await requireAdminAction();

  await prisma.assessment.update({
    where: { id: input.recordId },
    data: {
      ...(input.district ? { district: input.district } : {}),
      ...(input.waterSource ? { waterSource: input.waterSource } : {}),
      ...(input.riskLevel ? { riskLevel: input.riskLevel } : {}),
      ...(input.validationStatus ? { validationStatus: input.validationStatus } : {}),
      ...(input.dehydrationLevel ? { dehydrationLevel: input.dehydrationLevel } : {}),
      ...(input.validationNotes !== undefined ? { validationNotes: input.validationNotes } : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DISEASE_CASE_VALIDATED",
      entity: "Assessment",
      entityId: input.recordId,
      description: `Administrator ${session.user.name} updated disease record #${input.recordId.slice(0, 8)}.`,
      metadata: { ...input },
    },
  });

  revalidatePath("/admin/records");
  revalidatePath("/admin/assessments");
}
