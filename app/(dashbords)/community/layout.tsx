import CommunityNav from "@/components/layout/community-nav";
import { requireCommunityPage } from "@/lib/community-auth";
import prisma from "@/lib/prisma";

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireCommunityPage();

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, status: "UNREAD" },
  });

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CU";

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <CommunityNav initials={initials} unreadCount={unreadCount} />
      <main>{children}</main>
    </div>
  );
}
