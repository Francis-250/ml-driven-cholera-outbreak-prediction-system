"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/hooks/get-server-session";
import prisma from "@/lib/prisma";

type AccountInput = {
  name: string;
  displayUsername?: string;
  phoneNumber?: string;
};

type CommunityProfileInput = {
  age?: number | null;
  gender?: string | null;
  district?: string | null;
  sector?: string | null;
  cell?: string | null;
  primaryWaterSource?: string | null;
  householdSize?: number | null;
  existingConditions?: string | null;
};

const cleanOptional = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export async function updateCommunityAccount(input: AccountInput) {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const name = input.name.trim();

  if (!name) {
    throw new Error("Name is required.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      displayUsername: cleanOptional(input.displayUsername),
      phoneNumber: cleanOptional(input.phoneNumber),
    },
  });

  revalidatePath("/community/profile");
  revalidatePath("/patient/profile");
}

export async function updateCommunityProfile(input: CommunityProfileInput) {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await prisma.communityProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      age: input.age ?? null,
      gender: cleanOptional(input.gender),
      district: cleanOptional(input.district) ?? "Gasabo",
      sector: cleanOptional(input.sector),
      cell: cleanOptional(input.cell),
      primaryWaterSource: cleanOptional(input.primaryWaterSource) ?? "Municipal Tap",
      householdSize: input.householdSize ?? 4,
      existingConditions: cleanOptional(input.existingConditions),
    },
    update: {
      age: input.age ?? null,
      gender: cleanOptional(input.gender),
      district: cleanOptional(input.district) ?? "Gasabo",
      sector: cleanOptional(input.sector),
      cell: cleanOptional(input.cell),
      primaryWaterSource: cleanOptional(input.primaryWaterSource) ?? "Municipal Tap",
      householdSize: input.householdSize ?? 4,
      existingConditions: cleanOptional(input.existingConditions),
    },
  });

  revalidatePath("/community/profile");
  revalidatePath("/community");
}

export async function revokeCommunitySession(sessionId: string) {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.session?.id === sessionId) {
    throw new Error("You cannot revoke your current session here.");
  }

  await prisma.session.deleteMany({
    where: {
      id: sessionId,
      userId: session.user.id,
    },
  });

  revalidatePath("/community/profile");
}

// Backward compatibility aliases
export async function updatePatientAccount(input: AccountInput) {
  return updateCommunityAccount(input);
}
export async function updatePatientMedicalProfile(input: CommunityProfileInput) {
  return updateCommunityProfile(input);
}
export async function revokePatientSession(sessionId: string) {
  return revokeCommunitySession(sessionId);
}
