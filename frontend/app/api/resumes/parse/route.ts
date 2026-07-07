import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resumeParsingService } from "@/features/resume/services/resumeParsing.service";

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
    const { resumeId, force } = body;

    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID is required." },
        { status: 400 }
      );
    }

    // 3. Delegate execution to ResumeParsingService
    const updatedResume = await resumeParsingService.parseResume(
      supabase,
      resumeId,
      !!force
    );

    return NextResponse.json(updatedResume);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process resume parsing.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Permission denied") ? 403 : 500 }
    );
  }
}
