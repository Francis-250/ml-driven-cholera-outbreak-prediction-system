import { redirect } from "next/navigation";
import {
  PatientNotificationsClient,
  type PatientNotificationItem,
} from "@/components/patient-notifications-client";
import { requireCommunityPage } from "@/lib/community-auth";
import prisma from "@/lib/prisma";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function CommunityAlertsPage() {
  const session = await requireCommunityPage();

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      status: true,
      createdAt: true,
      assessmentId: true,
    },
  });

  const initialNotifications: PatientNotificationItem[] = notifications.map(
    (notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      status: notification.status,
      date: formatDateTime(notification.createdAt),
      assessmentId: notification.assessmentId,
    }),
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Outbreak Alerts & Notifications</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Stay informed with real-time risk alerts and physician reviews of your submitted cases.
        </p>
      </div>
      <PatientNotificationsClient initialNotifications={initialNotifications} />
    </div>
  );
}
