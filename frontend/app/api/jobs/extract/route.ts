import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tailoringService } from "@/features/resume/services/tailoring.service";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // 2. Parse body parameters
    const body = await request.json().catch(() => ({}));
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "Job URL is required." },
        { status: 400 }
      );
    }

    // Validate URL syntax roughly
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return NextResponse.json(
        { error: "Invalid URL protocol. URL must start with http:// or https://" },
        { status: 400 }
      );
    }

    // 3. Delegate to TailoringService
    const details = await tailoringService.extractJobDetails(url);

    return NextResponse.json(details);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to extract job details from URL.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
