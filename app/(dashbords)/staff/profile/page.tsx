import { StaffProfileClient } from "@/components/staff-profile-client";
import { requireStaffPage } from "@/lib/staff-auth";
import prisma from "@/lib/prisma";

export default async function StaffProfilePage() {
  const session = await requireStaffPage();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      staffProfile: true,
      sessions: { orderBy: { updatedAt: "desc" } },
    },
  });
  if (!user) return null;

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);

  return (
    <StaffProfileClient
      user={{
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayUsername: user.displayUsername,
        twoFactorEnabled: user.twoFactorEnabled ?? false,
      }}
      profile={{
        specialization: user.staffProfile?.specialization ?? null,
        hospitalName: user.staffProfile?.hospitalName ?? null,
        licenseNumber: user.staffProfile?.licenseNumber ?? null,
        isVerified: user.staffProfile?.isVerified ?? true,
      }}
      sessions={user.sessions.map((item) => ({
        id: item.id,
        ipAddress: item.ipAddress,
        userAgent: item.userAgent,
        updatedAt: formatDate(item.updatedAt),
        current: item.id === session.session.id,
      }))}
    />
  );
}
