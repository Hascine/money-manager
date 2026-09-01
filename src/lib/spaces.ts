import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface UserSpace {
  id: string;
  name: string;
  type: "PERSONAL" | "COLLABORATIVE";
  role: "owner" | "admin" | "member" | "viewer";
}

/** All spaces the current user belongs to, personal space first. */
export async function getUserSpaces(): Promise<UserSpace[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // space_members RLS only scopes rows to "spaces you belong to", not "rows
  // that are yours" (other members' rows in a shared space are visible too,
  // for the members-management page) — so this list must filter by
  // profile_id itself, or a space with N members would show N times here.
  const { data, error } = await supabase
    .from("space_members")
    .select("role, spaces!inner(id, name, type)")
    .eq("profile_id", user.id)
    .is("deleted_at", null)
    .is("spaces.deleted_at", null);

  if (error || !data) return [];

  return data
    .map((row) => ({
      id: row.spaces.id,
      name: row.spaces.name,
      type: row.spaces.type,
      role: row.role,
    }))
    .sort((a, b) => (a.type === "PERSONAL" ? -1 : b.type === "PERSONAL" ? 1 : 0));
}

/** The current user's role in a specific space, or null if not a member. */
export async function getMyRole(spaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("space_members")
    .select("role")
    .eq("space_id", spaceId)
    .eq("profile_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  return data?.role ?? null;
}

export async function getSpace(spaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("spaces")
    .select("id, name, type")
    .eq("id", spaceId)
    .is("deleted_at", null)
    .single();
  return data;
}

/**
 * Defense-in-depth, not the security boundary (RLS already guarantees a
 * non-member's queries return nothing) — this turns a silently empty
 * dashboard into an explicit redirect.
 */
export async function assertSpaceMember(spaceId: string) {
  const space = await getSpace(spaceId);
  if (!space) redirect("/app");
  return space;
}
