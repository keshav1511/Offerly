import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // Default to /resumes dashboard if next parameter is omitted
  const next = searchParams.get("next") ?? "/resumes";

  const supabase = await createClient();
  let authenticated = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      authenticated = true;
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      authenticated = true;
    }
  }

  if (authenticated) {
    const { data: { user } } = await supabase.auth.getUser();
    let targetNext = next;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, onboarding_step")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        if (!profile.onboarding_completed) {
          targetNext = `/onboarding/${profile.onboarding_step || "resume"}`;
        } else if (next === "/resumes") {
          targetNext = "/dashboard";
        }
      }
    }

    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${targetNext}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${targetNext}`);
    } else {
      return NextResponse.redirect(`${origin}${targetNext}`);
    }
  }

  // Redirect to login page on authentication callback failure
  return NextResponse.redirect(`${origin}/onboarding/email?error=auth-callback-failed`);
}
