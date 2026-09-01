"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Subscribes to live changes for this space and refreshes the current route
 * so Server Components refetch through RLS — no client cache layer needed
 * since Finora is fully online. */
export function SpaceRealtimeProvider({ spaceId }: { spaceId: string }) {
  const router = useRouter();
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const refresh = () => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => router.refresh(), 300);
    };

    const channel = supabase
      .channel(`space:${spaceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `space_id=eq.${spaceId}` },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "accounts", filter: `space_id=eq.${spaceId}` },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "space_members", filter: `space_id=eq.${spaceId}` },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transfers", filter: `from_space_id=eq.${spaceId}` },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transfers", filter: `to_space_id=eq.${spaceId}` },
        refresh
      )
      .subscribe();

    return () => {
      if (timeout.current) clearTimeout(timeout.current);
      supabase.removeChannel(channel);
    };
  }, [spaceId, router]);

  return null;
}
