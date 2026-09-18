"use server";

import prisma from "@/lib/prisma";
import { requireAdminAction } from "@/lib/admin-auth";

export async function exportDiseaseCasesCSV() {
  const session = await requireAdminAction();

  const cases = await prisma.assessment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const headers = [
    "Case ID",
    "Date",
    "Patient Name",
    "Age",
    "Gender",
    "District",
    "Water Source",
    "Stool Type",
    "Dehydration Level",
    "Risk Level",
    "Confidence (%)",
    "Cholera Risk Score",
    "Emergency Required",
    "Validation Status",
    "Validated At",
    "Case Type",
    "Reporter Email",
  ];

  const rows = cases.map((c) => [
    `"${c.id}"`,
    `"${c.createdAt.toISOString()}"`,
    `"${(c.patientName || c.user?.name || "").replace(/"/g, '""')}"`,
    `"${c.patientAge ?? "N/A"}"`,
    `"${c.patientGender ?? "N/A"}"`,
    `"${c.district ?? "N/A"}"`,
    `"${(c.waterSource || "").replace(/"/g, '""')}"`,
    `"${(c.stoolType || "").replace(/"/g, '""')}"`,
    `"${c.dehydrationLevel ?? "N/A"}"`,
    `"${c.riskLevel}"`,
    `"${Math.round(c.confidenceScore * 100)}"`,
    `"${c.choleraRiskScore}"`,
    `"${c.requiresEmergency ? "YES" : "NO"}"`,
    `"${c.validationStatus}"`,
    `"${c.validatedAt ? c.validatedAt.toISOString() : "N/A"}"`,
    `"${c.caseType ?? "COMMUNITY_REPORT"}"`,
    `"${c.user?.email || "N/A"}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "REPORT_EXPORTED",
      entity: "Assessment",
      description: `Administrator ${session.user.name} exported cholera disease cases report (${cases.length} records).`,
      metadata: { recordCount: cases.length, type: "DISEASE_CASES_CSV" },
    },
  });

  return csvContent;
}

export async function exportEnvironmentalDataCSV() {
  const session = await requireAdminAction();

  const data = await prisma.environmentalData.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { name: true, email: true } },
    },
  });

  const headers = [
    "Record ID",
    "Date",
    "District",
    "Location",
    "Water Source",
    "Contamination Level",
    "Residual Chlorine (mg/L)",
    "Sanitation Score",
    "Rainfall (mm)",
    "Temperature (C)",
    "Turbidity (NTU)",
    "pH Level",
    "Flood Risk",
    "Outbreak Risk Score",
    "Risk Level",
    "Clinician",
  ];

  const rows = data.map((d) => [
    `"${d.id}"`,
    `"${d.createdAt.toISOString()}"`,
    `"${d.district}"`,
    `"${(d.location || "").replace(/"/g, '""')}"`,
    `"${d.waterSource}"`,
    `"${d.waterContaminationLevel}"`,
    `"${d.chlorineResidual ?? "N/A"}"`,
    `"${d.sanitationScore ?? "N/A"}"`,
    `"${d.rainfallMm ?? "N/A"}"`,
    `"${d.temperature ?? "N/A"}"`,
    `"${d.turbidityNtu ?? "N/A"}"`,
    `"${d.phLevel ?? "N/A"}"`,
    `"${d.floodRisk ? "YES" : "NO"}"`,
    `"${d.outbreakRiskScore}"`,
    `"${d.riskLevel}"`,
    `"${d.uploadedBy?.name || "N/A"}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "REPORT_EXPORTED",
      entity: "EnvironmentalData",
      description: `Administrator ${session.user.name} exported environmental surveillance report (${data.length} records).`,
      metadata: { recordCount: data.length, type: "ENVIRONMENTAL_CSV" },
    },
  });

  return csvContent;
}

export async function exportAuditLogsCSV() {
  const session = await requireAdminAction();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const headers = [
    "Log ID",
    "Date",
    "User",
    "Email",
    "Action",
    "Entity",
    "Entity ID",
    "Description",
    "IP Address",
  ];

  const rows = logs.map((l) => [
    `"${l.id}"`,
    `"${l.createdAt.toISOString()}"`,
    `"${l.user?.name || "System"}"`,
    `"${l.user?.email || "N/A"}"`,
    `"${l.action}"`,
    `"${l.entity || "N/A"}"`,
    `"${l.entityId || "N/A"}"`,
    `"${(l.description || "").replace(/"/g, '""')}"`,
    `"${l.ipAddress || "N/A"}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "REPORT_EXPORTED",
      entity: "AuditLog",
      description: `Administrator ${session.user.name} exported audit log report (${logs.length} records).`,
      metadata: { recordCount: logs.length, type: "AUDIT_LOGS_CSV" },
    },
  });

  return csvContent;
}
