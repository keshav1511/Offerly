"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, AlertCircle, Loader2 } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { Button } from "@/components/Button";
import { AuthPageTransition } from "@/features/auth/components/AuthPageTransition";
import { useResumeUpload } from "@/features/resume/hooks/useResumeUpload";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "@/features/resume/resume.validation";
import { useUpdateProfile } from "@/features/auth/hooks/useProfile";

export default function OnboardingResumePage() {
  const router = useRouter();
  const { mutate: updateProfile } = useUpdateProfile();

  useEffect(() => {
    updateProfile({ onboarding_step: "resume" });
  }, [updateProfile]);

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    startUpload,
    cancel,
    retry,
    progress,
    error: uploadError,
    isUploading,
    isError,
  } = useResumeUpload();

  const validateAndSetFile = useCallback((selectedFile: File) => {
    setValidationError(null);

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setValidationError("Invalid file type. Only PDF and DOCX files are supported.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setValidationError("File is too large. Maximum size allowed is 5MB.");
      return;
    }

    setFile(selectedFile);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [validateAndSetFile]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      // Establish 'Master Resume' as the user's canonical career document
      const newResume = await startUpload(file, "Master Resume");
      if (newResume && newResume.id) {
        router.push(`/onboarding/extract?resumeId=${newResume.id}`);
      }
    } catch (err) {
      console.error("Upload failed in onboarding:", err);
    }
  };

  const triggerFileInput = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleClear = () => {
    setFile(null);
    setValidationError(null);
    cancel();
  };

  const displayError = validationError || uploadError;

  return (
    <AuthPageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            <span>STEP: MASTER_RESUME_UPLOAD</span>
            <span>1 / 5</span>
          </div>
          <div className="h-1 w-full bg-secondary flex gap-0.5" role="progressbar" aria-valuenow={20} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full w-1/5 bg-accent" />
            <div className="h-full w-4/5 bg-secondary" />
          </div>
        </div>

        <AuthCard>
          <AuthHeader
            title="UPLOAD MASTER RESUME"
            subtitle="Upload your Master Resume—the canonical source of your career history. We will auto-generate tailored versions for specific roles later."
          />

          {!isUploading ? (
            <div className="space-y-4">
              {!file ? (
                <div
                  role="button"
                  tabIndex={0}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      triggerFileInput();
                    }
                  }}
                  className={`flex flex-col items-center justify-center border border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-ring ${
                    dragActive
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent bg-background/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileInputChange}
                  />
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-4 bg-secondary/50">
                    <UploadCloud className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-mono uppercase tracking-wider font-semibold">
                    Drag & Drop Master Resume Here
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1.5 uppercase font-mono">
                    PDF or DOCX (max. 5MB)
                  </p>
                </div>
              ) : (
                <div className="border border-border p-5 bg-background/30 space-y-4 rounded-lg">
                  <div className="flex items-center gap-3 bg-secondary/30 border border-border p-3">
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-grow text-left">
                      <p className="text-xs font-mono font-semibold truncate">
                        {file.name}
                      </p>
                      <p className="text-[9px] font-mono text-muted-foreground">
                        {Math.round((file.size / 1024) * 10) / 10} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-muted-foreground hover:text-foreground text-xs uppercase font-mono cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  {!isError ? (
                    <AuthButton
                      onClick={handleUploadSubmit}
                      variant="primary"
                      fullWidth
                      aria-label="Upload master resume and extract profile details"
                    >
                      PROCEED TO EXTRACTION
                    </AuthButton>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClear}
                        className="flex-1 font-mono text-[10px] uppercase border-zinc-200 dark:border-zinc-800 text-zinc-500"
                      >
                        Select Another
                      </Button>
                      <Button
                        type="button"
                        onClick={retry}
                        className="flex-1 font-mono text-[10px] uppercase bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950"
                      >
                        Retry Upload
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="border border-border p-5 sm:p-8 bg-background/30 space-y-6 text-center rounded-lg">
              <div className="flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="text-xs font-mono uppercase tracking-wider font-semibold">
                  Uploading Master Resume...
                </p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase">
                  AI will map structured sections next
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground uppercase">
                  <span>Uploading files</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-secondary h-1.5 overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={cancel}
                className="w-full font-mono text-[10px] uppercase border border-zinc-200 dark:border-zinc-850 text-zinc-500"
              >
                Cancel Upload
              </Button>
            </div>
          )}

          {displayError && (
            <div className="flex items-start gap-2.5 p-3 border border-destructive/20 rounded bg-destructive/5 mt-4 text-left">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono text-destructive leading-relaxed uppercase">
                {displayError}
              </p>
            </div>
          )}
        </AuthCard>
      </div>
    </AuthPageTransition>
  );
}
