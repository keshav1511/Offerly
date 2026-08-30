import React from "react";

interface ATSScoreCardProps {
  score: number;
  keywordScore?: number;
  skillsMatch?: number;
  experienceMatch?: number;
  educationMatch?: number;
  projectsMatch?: number;
  responsibilityMatch?: number;
  eligibilityDetails?: {
    readiness: number;
    eligibility: "Low" | "Medium" | "High";
    competition: "Low" | "Medium" | "High";
    reasoning: string;
  };
  recommendation?: {
    decision: "ready_to_apply" | "tailoring_recommended" | "not_recommended";
    reason: string;
  };
}

export function ATSScoreCard({ 
  score, 
  keywordScore, 
  skillsMatch, 
  experienceMatch, 
  educationMatch, 
  projectsMatch, 
  responsibilityMatch,
  eligibilityDetails,
  recommendation
}: ATSScoreCardProps) {
  // SVG properties
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strengthLabel = "Weak Match";
  let textColor = "text-rose-600 dark:text-rose-400";
  let strokeColor = "stroke-rose-600 dark:stroke-rose-450";
  let hiringLikelihood = "Low Likelihood";

  if (score >= 80) {
    strengthLabel = "Excellent Match";
    textColor = "text-green-600 dark:text-green-400";
    strokeColor = "stroke-green-600 dark:stroke-green-450";
    hiringLikelihood = "High Likelihood";
  } else if (score >= 65) {
    strengthLabel = "Good Match";
    textColor = "text-amber-600 dark:text-amber-400";
    strokeColor = "stroke-amber-600 dark:stroke-amber-450";
    hiringLikelihood = "Moderate Likelihood";
  }

  // Mini progress bar helper
  const renderMiniMetric = (label: string, value?: number) => {
    if (value === undefined) return null;
    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-zinc-400">
          <span>{label}</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">{value}%</span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1 rounded-full overflow-hidden">
          <div 
            className="bg-zinc-800 dark:bg-zinc-200 h-full transition-all duration-500" 
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-left">
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        {/* SVG Ring Gauge */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="stroke-zinc-100 dark:stroke-zinc-900 fill-none"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className={`${strokeColor} fill-none transition-all duration-1000 ease-out`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Score overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
            <span className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-50">{score}%</span>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-semibold">Match</span>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className={`text-xs font-mono uppercase font-bold tracking-wider ${textColor}`}>
                {strengthLabel}
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/40 rounded uppercase font-semibold">
                {hiringLikelihood}
              </span>
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">
              ATS Matching Alignment
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Your resume aligns with {score}% of the target requirements. Optimization checks highlight missing skills, keyword densities, and styling recommendations.
            </p>
          </div>

          {/* Multidimensional Breakdown Grid */}
          {(keywordScore !== undefined || skillsMatch !== undefined || experienceMatch !== undefined || projectsMatch !== undefined || responsibilityMatch !== undefined) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 border-t border-zinc-100 dark:border-zinc-900 pt-4 text-left">
              {renderMiniMetric("Skills Compatibility", skillsMatch)}
              {renderMiniMetric("Seniority & Experience", experienceMatch)}
              {renderMiniMetric("Keyword Match", keywordScore)}
              {renderMiniMetric("Projects Relevancy", projectsMatch)}
              {renderMiniMetric("Responsibility Overlap", responsibilityMatch)}
              {renderMiniMetric("Education Compliance", educationMatch)}
            </div>
          )}
        </div>
      </div>

      {/* Transparency Years of Experience Reasoning */}
      {eligibilityDetails && (
        <div className="border border-zinc-200 dark:border-zinc-850 p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-lg space-y-2">
          <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-semibold">
            <span>CANDIDATE ELIGIBILITY</span>
            <span className="text-accent font-bold">
              {eligibilityDetails.eligibility} ELIGIBILITY &bull; {eligibilityDetails.competition} COMPETITION
            </span>
          </div>
          <p className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase">
            {eligibilityDetails.reasoning}
          </p>
        </div>
      )}

      {/* Decision recommendation Alert banner */}
      {recommendation && (
        <div className="border border-zinc-200 dark:border-zinc-850 p-4 rounded-lg bg-background/30 flex gap-3 items-start">
          <div className="mt-0.5">
            {recommendation.decision === "ready_to_apply" && (
              <span className="h-2 w-2 rounded-full bg-green-500 block animate-pulse" />
            )}
            {recommendation.decision === "tailoring_recommended" && (
              <span className="h-2 w-2 rounded-full bg-amber-500 block animate-pulse" />
            )}
            {recommendation.decision === "not_recommended" && (
              <span className="h-2 w-2 rounded-full bg-red-500 block animate-pulse" />
            )}
          </div>
          <div className="space-y-1">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider">
              AI Decision: {recommendation.decision.replace(/_/g, " ")}
            </h4>
            <p className="font-mono text-[10px] text-zinc-500 uppercase leading-relaxed">
              {recommendation.reason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
