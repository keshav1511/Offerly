import React from "react";
import { ArrowLeft, Edit3, Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";

interface ActionPanelProps {
  resumeId: string;
}

export function ActionPanel({ resumeId }: ActionPanelProps) {
  const router = useRouter();

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      <div className="space-y-1">
        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 font-mono uppercase tracking-wider">
          Next Steps & Optimization
        </h4>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
          Re-tailor details using AI or manually edit qualifications inside the Studio.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          onClick={() => router.push("/resumes")}
          className="border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 text-xs font-mono tracking-wider uppercase font-semibold flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Library</span>
        </Button>

        <Button
          onClick={() => router.push(`/resumes/${resumeId}/tailor`)}
          variant="outline"
          className="border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 text-xs font-mono tracking-wider uppercase font-semibold flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-650 dark:text-purple-400" />
          <span>Re-Tailor</span>
        </Button>

        <Button
          disabled
          className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 px-4 py-2 text-xs font-mono tracking-wider uppercase font-semibold flex items-center gap-1.5 cursor-not-allowed opacity-50"
          title="Manual Edit (Future Module)"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Resume</span>
        </Button>
      </div>
    </div>
  );
}
