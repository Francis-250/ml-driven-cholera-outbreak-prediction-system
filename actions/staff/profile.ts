"use server";

import { revalidatePath } from "next/cache";
import { requireStaffAction } from "@/lib/staff-auth";
import prisma from "@/lib/prisma";

type AccountInput = {
  name: string;
  phoneNumber?: string;
  displayUsername?: string;
};

type ProfessionalInput = {
  specialization?: string;
  hospitalName?: string;
  licenseNumber?: string;
};

export async function updateStaffAccount(input: AccountInput) {
  const session = await requireStaffAction();
  const name = input.name.trim();
  if (!name) throw new Error("Name is required.");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phoneNumber: input.phoneNumber?.trim() || null,
      displayUsername: input.displayUsername?.trim() || null,
    },
  });

  revalidatePath("/staff/profile");
}

export async function updateStaffProfessional(input: ProfessionalInput) {
  const session = await requireStaffAction();

  await prisma.staffProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      specialization: input.specialization?.trim() || null,
      hospitalName: input.hospitalName?.trim() || null,
      licenseNumber: input.licenseNumber?.trim() || null,
      isVerified: true,
      isApprovedByAdmin: true,
    },
    update: {
      specialization: input.specialization?.trim() || null,
      hospitalName: input.hospitalName?.trim() || null,
      licenseNumber: input.licenseNumber?.trim() || null,
    },
  });

  revalidatePath("/staff/profile");
}

export async function revokeStaffSession(sessionId: string) {
  const session = await requireStaffAction();

  await prisma.session.deleteMany({
    where: {
      id: sessionId,
      userId: session.user.id,
    },
  });

  revalidatePath("/staff/profile");
}
