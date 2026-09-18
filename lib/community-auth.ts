import { redirect } from "next/navigation";
import { getServerSession } from "@/hooks/get-server-session";
import { roleHome } from "@/lib/auth-routing";

export function isCommunityRole(role?: string | null) {
  const r = role?.toLowerCase();
  return r === "community" || r === "community_user" || r === "patient";
}

export async function requireCommunityPage() {
  const session = await getServerSession();

  if (!session?.user) redirect("/auth/login");
  if (!isCommunityRole(session.user.role)) redirect(roleHome(session.user.role));

  return session;
}

export async function requireCommunityAction() {
  const session = await getServerSession();

  if (!session?.user || !isCommunityRole(session.user.role)) {
    throw new Error("Unauthorized: Community access required.");
  }

  return session;
}

// Aliases for compatibility
export const isPatientRole = isCommunityRole;
export const requirePatientPage = requireCommunityPage;
export const requirePatientAction = requireCommunityAction;
