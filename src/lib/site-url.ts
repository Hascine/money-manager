import { headers } from "next/headers";

/** Derives the current origin from the incoming request so invite links
 * (and anything else needing an absolute URL) work correctly in local dev,
 * preview deployments, and production without hardcoding a domain. */
export async function getSiteUrl() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
