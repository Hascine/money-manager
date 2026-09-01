import { createClient } from "@/lib/supabase/server";

export async function hasCompletedOnboarding(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return true; // not our concern here — auth guards handle this elsewhere

  const { data } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .single();

  return Boolean(data?.onboarding_completed_at);
}
