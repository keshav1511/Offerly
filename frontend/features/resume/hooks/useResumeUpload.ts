import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { resumeUploadService, UploadControl } from "../services/resumeUpload.service";
import { resumeService } from "../services/resume.service";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

/**
 * Custom React Hook to manage upload lifecycle state, tracking real-time
 * progress, cancellation triggers, error messages, and retry capabilities.
 */
export function useResumeUpload() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // References to handle retries and cancellation
  const activeUploadRef = useRef<UploadControl | null>(null);
  const currentFileRef = useRef<File | null>(null);
  const currentVersionNameRef = useRef<string>("");

  const cancel = useCallback(() => {
    if (activeUploadRef.current) {
      activeUploadRef.current.abort();
      activeUploadRef.current = null;
      setStatus("idle");
      setProgress(0);
    }
  }, []);

  const startUpload = useCallback(async (file: File, versionName: string) => {
    // Keep reference in case of retry
    currentFileRef.current = file;
    currentVersionNameRef.current = versionName;

    setStatus("uploading");
    setProgress(0);
    setError(null);

    const control = resumeUploadService.upload(file, (percent) => {
      setProgress(percent);
    });

    activeUploadRef.current = control;

    try {
      // 1. Await file storage upload
      const storagePath = await control.promise;
      
      // 2. Await database metadata sync
      await resumeService.saveResumeMetadata(storagePath, versionName, file);

      setStatus("success");
      setProgress(100);
      
      // 3. Invalidate TanStack cache to sync list view
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    } catch (err) {
      // Ensure we don't overwrite user cancellation with an error status
      if (err instanceof Error && err.message.includes("aborted")) {
        setStatus("idle");
        setProgress(0);
        return;
      }
      
      setError(err instanceof Error ? err.message : "Failed to upload resume.");
      setStatus("error");
    } finally {
      activeUploadRef.current = null;
    }
  }, [queryClient]);

  const retry = useCallback(() => {
    if (currentFileRef.current && currentVersionNameRef.current) {
      startUpload(currentFileRef.current, currentVersionNameRef.current);
    }
  }, [startUpload]);

  return {
    startUpload,
    cancel,
    retry,
    status,
    progress,
    error,
    isUploading: status === "uploading",
    isError: status === "error",
    isSuccess: status === "success",
  };
}
