import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This will refresh the session if expired and verify authentication status
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/resumes") ||
    pathname.startsWith("/jobs") ||
    pathname.startsWith("/companies") ||
    pathname.startsWith("/settings");

  const isOnboardingRoute = pathname.startsWith("/onboarding") && 
    !pathname.startsWith("/onboarding/email") && 
    !pathname.startsWith("/onboarding/otp");

  // If a protected route or onboarding route is requested and no user is authenticated, redirect to email login
  if ((isProtectedRoute || isOnboardingRoute) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/onboarding/email";
    return NextResponse.redirect(redirectUrl);
  }

  // Onboarding Gating checks
  if (user && (isProtectedRoute || isOnboardingRoute)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, onboarding_step")
      .eq("id", user.id)
      .maybeSingle();

    const onboardingCompleted = profile?.onboarding_completed ?? false;
    const onboardingStep = profile?.onboarding_step ?? "resume";

    if (!onboardingCompleted) {
      // If onboarding is incomplete, prevent accessing protected application routes
      if (isProtectedRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/onboarding/${onboardingStep}`;
        return NextResponse.redirect(redirectUrl);
      }
    } else {
      // If onboarding is complete, prevent accessing onboarding flow steps (except login/otp)
      if (isOnboardingRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/dashboard";
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
