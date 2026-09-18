import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const password = process.env.SEED_USER_PASSWORD ?? "CholeraPredict123!";

const users = {
  admin: {
    id: "seed-admin",
    name: "Dr. Amara Williams",
    email: "admin@cholerapredict.test",
    phoneNumber: "+250788000001",
    username: "admin",
    displayUsername: "Admin Amara",
    role: "admin",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
  },
  doctor: {
    id: "seed-doctor",
    name: "Dr. Daniel Carter",
    email: "doctor@cholerapredict.test",
    phoneNumber: "+250788000002",
    username: "doctor",
    displayUsername: "Dr. Carter",
    role: "doctor",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&q=80",
  },
  community: {
    id: "seed-community",
    name: "Maya Thompson",
    email: "community@cholerapredict.test",
    phoneNumber: "+250788000003",
    username: "community",
    displayUsername: "Maya",
    role: "community",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=256&q=80",
  },
} as const;

async function upsertUser(user: (typeof users)[keyof typeof users]) {
  return prisma.user.upsert({
    where: { email: user.email },
    create: {
      ...user,
      emailVerified: true,
      phoneNumberVerified: true,
      banned: false,
      twoFactorEnabled: false,
    },
    update: {
      name: user.name,
      image: user.image,
      phoneNumber: user.phoneNumber,
      phoneNumberVerified: true,
      username: user.username,
      displayUsername: user.displayUsername,
      role: user.role,
      emailVerified: true,
      banned: false,
      banReason: null,
      banExpires: null,
      twoFactorEnabled: false,
    },
  });
}

async function upsertCredential(userId: string, hashedPassword: string) {
  const existing = await prisma.account.findFirst({
    where: { userId, providerId: "credential" },
    select: { id: true },
  });

  if (existing) {
    await prisma.account.update({
      where: { id: existing.id },
      data: {
        accountId: userId,
        password: hashedPassword,
      },
    });
    return;
  }

  await prisma.account.create({
    data: {
      id: `seed-credential-${userId}`,
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
    },
  });
}

async function main() {
  const hashedPassword = await hashPassword(password);
  const [admin, doctor, community] = await Promise.all([
    upsertUser(users.admin),
    upsertUser(users.doctor),
    upsertUser(users.community),
  ]);

  await Promise.all([
    upsertCredential(admin.id, hashedPassword),
    upsertCredential(doctor.id, hashedPassword),
    upsertCredential(community.id, hashedPassword),
    prisma.doctorProfile.upsert({
      where: { userId: doctor.id },
      create: {
        userId: doctor.id,
        specialization: "Infectious Diseases & Epidemiology",
        hospitalName: "National Epidemic Response Center",
        licenseNumber: "RMC-EPID-2026-001",
        isVerified: true,
        verifiedAt: new Date(),
        isApprovedByAdmin: true,
        approvedByAdminAt: new Date(),
      },
      update: {
        specialization: "Infectious Diseases & Epidemiology",
        hospitalName: "National Epidemic Response Center",
        licenseNumber: "RMC-EPID-2026-001",
        isVerified: true,
        verifiedAt: new Date(),
        isApprovedByAdmin: true,
        approvedByAdminAt: new Date(),
      },
    }),
    prisma.communityProfile.upsert({
      where: { userId: community.id },
      create: {
        userId: community.id,
        age: 34,
        gender: "Female",
        district: "Gasabo",
        sector: "Kimironko",
        cell: "Kibagabaga",
        primaryWaterSource: "Municipal Tap",
        householdSize: 5,
        existingConditions: "None",
      },
      update: {
        district: "Gasabo",
        primaryWaterSource: "Municipal Tap",
        householdSize: 5,
      },
    }),
  ]);

  // Seed sample environmental surveillance data
  const sampleEnvironmental = [
    {
      id: "env-gasabo-1",
      district: "Gasabo",
      location: "Nyabugogo River Basin / Market",
      waterSource: "River / Runoff",
      waterContaminationLevel: "CRITICAL",
      chlorineResidual: 0.05,
      sanitationScore: 35.0,
      rainfallMm: 48.5,
      temperature: 27.2,
      turbidityNtu: 18.4,
      phLevel: 6.8,
      floodRisk: true,
      outbreakRiskScore: 88.0,
      riskLevel: "HIGH" as const,
      notes: "Severe fecal coliform contamination post-heavy rains. Unsafe for drinking.",
      uploadedByUserId: doctor.id,
    },
    {
      id: "env-kicukiro-1",
      district: "Kicukiro",
      location: "Gahanga Community Well",
      waterSource: "Shallow Well",
      waterContaminationLevel: "HIGH",
      chlorineResidual: 0.12,
      sanitationScore: 48.0,
      rainfallMm: 32.0,
      temperature: 26.5,
      turbidityNtu: 9.8,
      phLevel: 7.1,
      floodRisk: false,
      outbreakRiskScore: 68.0,
      riskLevel: "MEDIUM" as const,
      notes: "Inadequate chlorine residual. Water distribution point requires chlorination tablets.",
      uploadedByUserId: doctor.id,
    },
    {
      id: "env-nyarugenge-1",
      district: "Nyarugenge",
      location: "Nyamirambo Central Water Point",
      waterSource: "Municipal Tap",
      waterContaminationLevel: "SAFE",
      chlorineResidual: 0.55,
      sanitationScore: 82.0,
      rainfallMm: 12.0,
      temperature: 25.8,
      turbidityNtu: 1.2,
      phLevel: 7.4,
      floodRisk: false,
      outbreakRiskScore: 15.0,
      riskLevel: "LOW" as const,
      notes: "Adequate residual chlorination. Safe for public consumption.",
      uploadedByUserId: doctor.id,
    },
    {
      id: "env-rubavu-1",
      district: "Rubavu",
      location: "Lake Kivu Shoreline / Gisenyi",
      waterSource: "Lake / Open Source",
      waterContaminationLevel: "HIGH",
      chlorineResidual: 0.08,
      sanitationScore: 42.0,
      rainfallMm: 38.0,
      temperature: 28.0,
      turbidityNtu: 14.5,
      phLevel: 7.8,
      floodRisk: true,
      outbreakRiskScore: 76.0,
      riskLevel: "HIGH" as const,
      notes: "Cross-border trading point with elevated transmission risk.",
      uploadedByUserId: doctor.id,
    },
  ];

  for (const env of sampleEnvironmental) {
    await prisma.environmentalData.upsert({
      where: { id: env.id },
      create: env,
      update: env,
    });
  }

  // Seed sample cholera disease cases
  const sampleCases = [
    {
      id: "case-001",
      userId: community.id,
      patientName: "Maya Thompson",
      patientAge: 34,
      patientGender: "Female",
      district: "Gasabo",
      waterSource: "Shallow Well",
      stoolType: "Rice-water watery stool",
      dehydrationLevel: "SEVERE" as const,
      caseType: "COMMUNITY_REPORT" as const,
      validationStatus: "VALIDATED" as const,
      validatedById: doctor.id,
      validatedAt: new Date(),
      validationNotes: "Classic acute watery diarrhea with severe dehydration signs. IV Ringer's Lactate and CTC isolation initiated.",
      symptoms: ["watery_diarrhea", "vomiting", "sunken_eyes", "muscle_cramps", "rapid_weak_pulse", "excessive_thirst"],
      symptomsText: "Woke up with sudden profuse watery diarrhea resembling cloudy rice water. Constant vomiting and painful leg cramps.",
      riskLevel: "HIGH" as const,
      confidenceScore: 0.94,
      detectedSymptoms: ["Profuse rice-water diarrhea", "Frequent vomiting", "Severe dehydration", "Muscle cramps", "Weak pulse"],
      choleraRiskScore: 9,
      fastScore: 4,
      requiresEmergency: true,
      aiResponse: "Patient exhibits pathognomonic presentation of severe Vibrio cholerae infection with life-threatening hypovolemic shock hazard. Immediate IV fluid resuscitation with Ringer's Lactate (100ml/kg) required alongside Cholera Treatment Unit admission.",
      recommendation: "EMERGENCY: Immediate admission to Cholera Treatment Center. Administer IV Ringer's Lactate and oral zinc. Notify District Epidemiological Surveillance.",
      status: "REVIEWED" as const,
      reviewedByDoctor: true,
      reviewedAt: new Date(),
    },
    {
      id: "case-002",
      userId: community.id,
      patientName: "Jean-Pierre Mugabo",
      patientAge: 28,
      patientGender: "Male",
      district: "Kicukiro",
      waterSource: "Untreated Well",
      stoolType: "Loose watery stool",
      dehydrationLevel: "SOME" as const,
      caseType: "COMMUNITY_REPORT" as const,
      validationStatus: "PENDING" as const,
      symptoms: ["watery_diarrhea", "vomiting", "excessive_thirst"],
      symptomsText: "Had 5 episodes of loose watery stools in the last 8 hours with mild vomiting. Feeling thirsty and weak.",
      riskLevel: "MEDIUM" as const,
      confidenceScore: 0.82,
      detectedSymptoms: ["Watery diarrhea", "Moderate dehydration", "Thirst"],
      choleraRiskScore: 6,
      fastScore: 2,
      requiresEmergency: false,
      aiResponse: "Symptoms indicate moderate dehydration secondary to suspected acute watery diarrhea. Immediate supervised Oral Rehydration Therapy (ORS) is required to prevent progression to severe shock.",
      recommendation: "Begin ORS solution immediately (75ml/kg over 4 hours). Present at local clinic for clinical observation.",
      status: "COMPLETED" as const,
      reviewedByDoctor: false,
    },
    {
      id: "case-003",
      userId: community.id,
      patientName: "Amina Uwase",
      patientAge: 19,
      patientGender: "Female",
      district: "Nyarugenge",
      waterSource: "Municipal Tap",
      stoolType: "Soft stool",
      dehydrationLevel: "NONE" as const,
      caseType: "COMMUNITY_REPORT" as const,
      validationStatus: "VALIDATED" as const,
      validatedById: doctor.id,
      validatedAt: new Date(),
      validationNotes: "Non-cholera gastroenteritis. Vital signs normal, patient hydrated.",
      symptoms: ["mild_diarrhea", "nausea"],
      symptomsText: "Mild loose stool once today, slight nausea after lunch.",
      riskLevel: "LOW" as const,
      confidenceScore: 0.91,
      detectedSymptoms: ["Mild loose stool"],
      choleraRiskScore: 2,
      fastScore: 0,
      requiresEmergency: false,
      aiResponse: "Low risk of cholera. No signs of dehydration, absence of profuse watery diarrhea. Maintain hydration with clean water.",
      recommendation: "Drink clean boiled water. Continue normal diet and practice strict hand hygiene.",
      status: "REVIEWED" as const,
      reviewedByDoctor: true,
      reviewedAt: new Date(),
    },
  ];

  for (const c of sampleCases) {
    await prisma.assessment.upsert({
      where: { id: c.id },
      create: c,
      update: c,
    });
  }

  console.log("Seeded ML-Driven Cholera Outbreak Prediction System accounts:");
  console.table([
    { role: "admin", email: admin.email, password },
    { role: "doctor", email: doctor.email, password },
    { role: "community", email: community.email, password },
  ]);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
