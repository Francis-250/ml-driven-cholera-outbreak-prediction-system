import { redirect } from "next/navigation";
import { getServerSession } from "@/hooks/get-server-session";
import { roleHome } from "@/lib/auth-routing";
import prisma from "@/lib/prisma";

export function isStaffRole(role?: string | null) {
  const r = role?.toLowerCase();
  return r === "staff" || r === "doctor" || r === "admin";
}

export async function requireStaffPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const role = session.user.role?.toLowerCase();
  if (role !== "staff" && role !== "doctor" && role !== "admin") {
    redirect(roleHome(session.user.role));
  }

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      specialization: true,
      hospitalName: true,
      licenseNumber: true,
      isApprovedByAdmin: true,
    },
  });

  if (profile && !profile.isApprovedByAdmin) {
    redirect("/auth/doctor-pending");
  }

  return session;
}

export async function requireStaffAction() {
  const session = await getServerSession();

  const role = session?.user?.role?.toLowerCase();
  if (!session?.user || (role !== "staff" && role !== "doctor" && role !== "admin")) {
    throw new Error("Unauthorized: Staff privileges required.");
  }

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    select: { isApprovedByAdmin: true },
  });
  if (profile && !profile.isApprovedByAdmin) {
    throw new Error("Staff verification approval is required.");
  }

  return session;
}

// Backward compatibility aliases
export const isDoctorRole = isStaffRole;
export const requireDoctorPage = requireStaffPage;
export const requireDoctorAction = requireStaffAction;
