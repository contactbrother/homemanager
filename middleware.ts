import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refreshes the session, routes by role, and ends the session of a deactivated client.
 *
 * Role and deactivation are read once when they are not already carried in the request
 * cookies, then cached there for the life of the session. Querying `profiles` on every
 * request would put a database round trip in front of every navigation, which works
 * against SC-001 and Principle VII for the sake of a rare administrative event.
 *
 * The consequence is a bounded staleness window: a client deactivated mid-session keeps
 * their cached marker until the cookie is refreshed. That is acceptable because
 * `is_active()` in the row level security policies is the real guarantee. Even with a
 * stale cookie, a deactivated client's queries return nothing. See analyze finding R1.
 */
const CACHE_COOKIE = "dar-actor";

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic =
    path.startsWith("/sign-in") || path.startsWith("/auth/callback");

  if (!user) {
    if (isPublic) return response;
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Role and deactivation, from the cookie when we already know them.
  let actor = readActor(request);
  if (!actor) {
    const { data } = await supabase
      .from("profiles")
      .select("role, deactivated_at")
      .eq("id", user.id)
      .maybeSingle();

    actor = {
      role: data?.role === "admin" ? "admin" : "client",
      active: !data?.deactivated_at,
    };
    response.cookies.set(CACHE_COOKIE, `${actor.role}:${actor.active ? 1 : 0}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  if (!actor.active) {
    await supabase.auth.signOut();
    const ended = NextResponse.redirect(new URL("/sign-in?ended=1", request.url));
    ended.cookies.delete(CACHE_COOKIE);
    return ended;
  }

  if (isPublic) {
    return NextResponse.redirect(
      new URL(actor.role === "admin" ? "/admin" : "/", request.url),
    );
  }

  if (path.startsWith("/admin") && actor.role !== "admin") {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  if (!path.startsWith("/admin") && actor.role === "admin") {
    // The team's own client-side view is not part of this release.
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

function readActor(
  request: NextRequest,
): { role: "admin" | "client"; active: boolean } | null {
  const raw = request.cookies.get(CACHE_COOKIE)?.value;
  if (!raw) return null;
  const [role, active] = raw.split(":");
  if (role !== "admin" && role !== "client") return null;
  return { role, active: active === "1" };
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)"],
};
