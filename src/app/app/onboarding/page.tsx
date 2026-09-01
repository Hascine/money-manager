import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { OnboardingCarousel } from "@/components/onboarding-carousel";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ replay?: string }>;
}) {
  const { replay } = await searchParams;

  if (!replay && (await hasCompletedOnboarding())) {
    redirect("/app");
  }

  async function completeOnboarding() {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    await supabase
      .from("profiles")
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq("id", user.id);

    revalidatePath("/app", "layout");
    redirect("/app");
  }

  return (
    <div className="flex flex-1 flex-col">
      <OnboardingCarousel action={completeOnboarding} />
    </div>
  );
}
