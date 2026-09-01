import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session on every request. Named for src/proxy.ts
// (Next.js 16 renamed `middleware` to `proxy` — see AGENTS.md /
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Required: touches the session so @supabase/ssr can refresh an expiring
  // token before Server Components read cookies further down the request.
  await supabase.auth.getUser();

  return response;
}
