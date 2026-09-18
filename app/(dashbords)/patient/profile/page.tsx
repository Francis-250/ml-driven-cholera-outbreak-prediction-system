import { redirect } from "next/navigation";

export default function PatientProfileRedirect() {
  redirect("/community/profile");
}
