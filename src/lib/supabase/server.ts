import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

// `cookies()` is async as of Next.js 15+ (still true in 16) — see
// node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component during rendering — the proxy
            // (src/proxy.ts) already refreshes the session on every request,
            // so this can be safely ignored here.
          }
        },
      },
    }
  );
}
