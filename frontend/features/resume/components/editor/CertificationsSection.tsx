import React, { useState } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { ResumeStructuredData } from "../../types/parsing.types";

interface CertificationsSectionProps {
  setValue: UseFormSetValue<ResumeStructuredData>;
  watch: UseFormWatch<ResumeStructuredData>;
}

export function CertificationsSection({ setValue, watch }: CertificationsSectionProps) {
  const certifications = watch("certifications") || [];
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (certifications.includes(trimmed)) return; // Avoid exact duplicates

    const updated = [...certifications, trimmed];
    setValue("certifications", updated, { shouldDirty: true });
    setInputValue("");
  };

  const handleRemove = (index: number) => {
    const updated = certifications.filter((_, i) => i !== index);
    setValue("certifications", updated, { shouldDirty: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-zinc-950 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div>
        <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-950 pb-2">
          Certifications & Licenses
        </h2>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1">
          Add professional certifications, courses, or industry credentials.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            placeholder="e.g. AWS Certified Solutions Architect"
          />
          <Button
            type="button"
            onClick={handleAdd}
            variant="outline"
            className="h-9 px-3 shrink-0 flex items-center justify-center gap-1 border border-zinc-200 dark:border-zinc-800 font-mono text-xs uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </Button>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden">
          {certifications.length === 0 ? (
            <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 italic p-4 text-center">
              No certifications listed.
            </p>
          ) : (
            certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-zinc-50/20 dark:bg-zinc-900/10 font-mono text-xs text-zinc-800 dark:text-zinc-200"
              >
                <span>{cert}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 rounded transition-colors"
                  title="Remove certification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
