import { redirect } from "next/navigation";

export default async function AssessmentIdRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/community/symptoms/${id}`);
}
