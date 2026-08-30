import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { atsReportService } from "@/lib/ats/ats-report.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const supabase = await createClient();
    const { analysisId } = await params;

    if (!analysisId) {
      return NextResponse.json(
        { error: "Analysis ID is required." },
        { status: 400 }
      );
    }

    const report = await atsReportService.getCachedATSReport(supabase, analysisId);
    if (!report) {
      return NextResponse.json(
        { error: "ATS Match Report not found or no cached analysis exists for this ID." },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve ATS Match Report.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
