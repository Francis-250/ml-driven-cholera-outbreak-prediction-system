import { redirect } from "next/navigation";

export default function PatientNotificationsRedirect() {
  redirect("/community/notifications");
}
