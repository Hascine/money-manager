import { redirect } from "next/navigation";
import { getUserSpaces } from "@/lib/spaces";
import { hasCompletedOnboarding } from "@/lib/onboarding";

export default async function AppIndexPage() {
  if (!(await hasCompletedOnboarding())) redirect("/app/onboarding");

  const spaces = await getUserSpaces();
  const personal = spaces.find((s) => s.type === "PERSONAL") ?? spaces[0];

  if (!personal) redirect("/login");
  redirect(`/app/${personal.id}`);
}
