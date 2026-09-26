import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * FR-001. Exchanges the code for a session. A link that is expired, already used or
 * superseded is refused with an explanation and an offer to request another, which the
 * sign-in screen renders from `?error=link`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=link`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=link`);
  }

  // Only same-site paths, so the link cannot be turned into a redirect elsewhere.
  const next = searchParams.get("next");
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  // Middleware routes to /admin or / by role on the next request.
  return NextResponse.redirect(`${origin}${safe}`);
}
