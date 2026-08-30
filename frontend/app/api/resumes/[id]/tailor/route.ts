import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tailoringService } from "@/features/resume/services/tailoring.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: resumeId } = await params;
    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID is required." },
        { status: 400 }
      );
    }

    // 2. Parse body parameters
    const body = await request.json().catch(() => ({}));
    const { action = "generate", jobDescription, versionName, tailoredData, jobSnapshot, explanation, atsScore, atsReport } = body;

    // Action 1: Generate Tailored Details (AI completion)
    if (action === "generate") {
      if (!jobDescription || !jobDescription.trim()) {
        return NextResponse.json(
          { error: "Job description is required for tailoring." },
          { status: 400 }
        );
      }

      const result = await tailoringService.generateTailoredResume(supabase, resumeId, jobDescription);
      return NextResponse.json(result);
    }

    // Action 2: Save Approved Tailored Resume Version
    if (action === "save") {
      if (!versionName || !versionName.trim()) {
        return NextResponse.json(
          { error: "Version name is required." },
          { status: 400 }
        );
      }
      if (!tailoredData) {
        return NextResponse.json(
          { error: "Tailored structured data is required." },
          { status: 400 }
        );
      }
      if (!jobSnapshot) {
        return NextResponse.json(
          { error: "Job snapshot details are required." },
          { status: 400 }
        );
      }

      const newResume = await tailoringService.saveTailoredVersion(
        supabase,
        resumeId,
        versionName,
        tailoredData,
        jobSnapshot,
        explanation || {},
        Number(atsScore) || 0,
        atsReport || undefined
      );

      return NextResponse.json(newResume);
    }

    return NextResponse.json(
      { error: `Unsupported action: ${action}` },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process resume tailoring action.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
