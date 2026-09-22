import { redirect } from "next/navigation";
import { getServerSession } from "@/hooks/get-server-session";
import { roleHome } from "@/lib/auth-routing";
import prisma from "@/lib/prisma";

export function isStaffRole(role?: string | null) {
  const r = role?.toLowerCase();
  return r === "staff" || r === "admin";
}

export async function requireStaffPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const role = session.user.role?.toLowerCase();
  if (role !== "staff" && role !== "admin") {
    redirect(roleHome(session.user.role));
  }

  return session;
}

export async function requireStaffAction() {
  const session = await getServerSession();

  const role = session?.user?.role?.toLowerCase();
  if (!session?.user || (role !== "staff" && role !== "admin")) {
    throw new Error("Unauthorized: Staff privileges required.");
  }

  return session;
}
