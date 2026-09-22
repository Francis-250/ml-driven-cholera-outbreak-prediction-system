import { StaffSidebar } from "@/components/layout/staff-sidebar";
import { requireStaffPage } from "@/lib/staff-auth";
import prisma from "@/lib/prisma";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaffPage();

  const profile = await prisma.staffProfile.findUnique({
    where: { userId: session.user.id },
    select: { specialization: true },
  });

  return (
    <div className="h-screen overflow-hidden bg-background">
      <StaffSidebar
        name={session.user.name}
        specialty={profile?.specialization ?? "Public Health Staff"}
      />
      <main className="h-[calc(100vh-3.5rem)] overflow-y-auto lg:ml-56 lg:h-screen">
        {children}
      </main>
    </div>
  );
}
