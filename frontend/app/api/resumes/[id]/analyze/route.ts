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
    const { jobDescription } = body;

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json(
        { error: "Job description is required for analysis." },
        { status: 400 }
      );
    }

    // 3. Delegate to TailoringService
    const report = await tailoringService.analyzeATSCompatibility(supabase, resumeId, jobDescription);

    return NextResponse.json(report);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to run ATS analysis.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}