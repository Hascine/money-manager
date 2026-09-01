"use client";

import { Select } from "@/components/ui/field";
import type { MemberRole } from "@/lib/supabase/database.types";

const ROLES: MemberRole[] = ["owner", "admin", "member", "viewer"];

export function RoleSelect({ defaultValue }: { defaultValue: MemberRole }) {
  return (
    <Select
      name="role"
      defaultValue={defaultValue}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="h-10 w-32 text-sm"
    >
      {ROLES.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </Select>
  );
}
