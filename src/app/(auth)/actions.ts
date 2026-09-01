"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeRedirectTarget(formData: FormData) {
  const value = String(formData.get("redirectTo") || "/app");
  // Only ever follow same-origin relative paths — never let a form field send
  // a user off-site.
  return value.startsWith("/") ? value : "/app";
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const redirectTo = safeRedirectTarget(formData);

  const { error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    options: {
      data: { display_name: String(formData.get("name")) },
    },
  });

  if (error) {
    redirect(
      `/signup?error=${encodeURIComponent(error.message)}&redirect=${encodeURIComponent(redirectTo)}`
    );
  }
  redirect(redirectTo);
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const redirectTo = safeRedirectTarget(formData);

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(error.message)}&redirect=${encodeURIComponent(redirectTo)}`
    );
  }
  redirect(redirectTo);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
