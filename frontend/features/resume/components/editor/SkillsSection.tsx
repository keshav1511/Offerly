import React, { useState } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/Button";
import { ResumeStructuredData } from "../../types/parsing.types";

interface SkillsSectionProps {
  setValue: UseFormSetValue<ResumeStructuredData>;
  watch: UseFormWatch<ResumeStructuredData>;
}

export function SkillsSection({ setValue, watch }: SkillsSectionProps) {
  const skills = watch("skills") || [];
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const handleAddSkill = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Case-insensitive duplicate check
    const isDuplicate = skills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      setError("This skill has already been added.");
      return;
    }

    const updated = [...skills, trimmed];
    setValue("skills", updated, { shouldDirty: true });
    setInputValue("");
    setError("");
  };

  const handleRemoveSkill = (index: number) => {
    const updated = skills.filter((_, i) => i !== index);
    setValue("skills", updated, { shouldDirty: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (error) {
      // Clear error if they edit
      setError("");
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-zinc-950 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div>
        <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-950 pb-2">
          Skills & Core Competencies
        </h2>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1">
          Add or remove professional skills, frameworks, and tools.
        </p>
      </div>

      <div className="space-y-4">
        {/* Add Skill Field */}
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
              placeholder="Type a skill and press Enter (e.g. React, Python)"
            />
            {error && (
              <p className="text-[10px] font-mono text-red-500">{error}</p>
            )}
          </div>
          <Button
            type="button"
            onClick={handleAddSkill}
            variant="outline"
            className="h-9 px-3 shrink-0 flex items-center justify-center gap-1 border border-zinc-200 dark:border-zinc-800 font-mono text-xs uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </Button>
        </div>

        {/* Skill Chips List */}
        <div className="flex flex-wrap gap-2 pt-2">
          {skills.length === 0 ? (
            <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 italic">
              No skills added yet. Add skills to help match jobs.
            </p>
          ) : (
            skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-800 dark:text-zinc-200 font-mono font-medium"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="w-3.5 h-3.5 flex items-center justify-center text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
