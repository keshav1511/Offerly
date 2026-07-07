import React, { useState, useCallback, useRef, useEffect } from "react";
import { UploadCloud, FileText, X, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "../resume.validation";
import { Button } from "@/components/Button";
import { useResumeUpload } from "../hooks/useResumeUpload";
import { useToast } from "@/providers/ToastProvider";

// Helper to extract a friendly version name from file names
const getCleanVersionName = (fileName: string) => {
  return fileName
    .replace(/\.[^/.]+$/, "") // Strip extension
    .replace(/[-_]/g, " ") // Replace dashes/underscores with spaces
    .trim();
};

export function UploadZone() {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [versionName, setVersionName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Consume our production-grade upload hook
  const {
    startUpload,
    cancel,
    retry,
    progress,
    error: uploadError,
    isUploading,
    isError,
    isSuccess,
  } = useResumeUpload();

  // Show Toast on success
  useEffect(() => {
    if (isSuccess && file) {
      toast(`Resume version "${versionName}" uploaded successfully.`, "success");
      setFile(null);
      setVersionName("");
    }
  }, [isSuccess, file, versionName, toast]);

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
    setVersionName(getCleanVersionName(selectedFile.name));
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
    if (!file || !versionName.trim()) return;
    await startUpload(file, versionName.trim());
  };

  const handleReset = () => {
    setFile(null);
    setVersionName("");
    setValidationError(null);
  };

  const triggerFileInput = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  // Accessible Keyboard events (Enter/Space triggers click)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerFileInput();
    }
  };

  const displayError = validationError || uploadError;

  return (
    <div className="space-y-4">
      {/* Upload Progress Panel (When active or error) */}
      {isUploading || isError ? (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 bg-white dark:bg-zinc-950 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-850 p-3 rounded">
            <div className="flex items-center gap-2.5 min-w-0">
              {isUploading ? (
                <Loader2 className="w-4 h-4 text-zinc-500 animate-spin shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {file?.name}
                </p>
                <p className="text-[10px] text-zinc-400">
                  Version: <span className="font-mono text-zinc-500">{versionName}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar (Visible during active uploads) */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-500 uppercase tracking-wider">Uploading file...</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">{progress}%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-zinc-900 dark:bg-white h-1.5 rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Abort/Cancel or Retry Actions */}
          <div className="flex justify-end gap-3 pt-2">
            {isUploading ? (
              <Button
                type="button"
                variant="outline"
                onClick={cancel}
                className="font-mono text-xs uppercase tracking-wider border-red-200 dark:border-red-950 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                Cancel Upload
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="font-mono text-xs uppercase tracking-wider"
                >
                  Start Over
                </Button>
                <Button
                  type="button"
                  onClick={retry}
                  className="font-mono text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Upload
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Drag & Drop Input Zone (Idle state) */
        !file ? (
          <div
            role="button"
            tabIndex={0}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            onKeyDown={handleKeyDown}
            aria-label="Upload resume drag and drop zone"
            aria-describedby="upload-instructions"
            className={`flex flex-col items-center justify-center border border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${
              dragActive
                ? "border-zinc-950 dark:border-white bg-zinc-50/50 dark:bg-zinc-900/10"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileInputChange}
              disabled={isUploading}
            />
            <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-3 bg-zinc-50 dark:bg-zinc-900 shadow-sm shrink-0">
              <UploadCloud className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p id="upload-instructions" className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-900 dark:text-zinc-50">
              Drag & Drop Resume
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
              PDF or DOCX (max. 5MB)
            </p>
          </div>
        ) : (
          /* File Selected & Version Name Form (Ready to Upload) */
          <form onSubmit={handleUploadSubmit} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 bg-white dark:bg-zinc-950 space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-850 p-3 rounded">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {Math.round((file.size / 1024) * 10) / 10} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                disabled={isUploading}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="version-name" className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                Resume Version Name *
              </label>
              <input
                id="version-name"
                type="text"
                disabled={isUploading}
                placeholder="e.g. Full Stack Engineer V2"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={handleReset}
                className="font-mono text-xs uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading || !versionName.trim()}
                className="font-mono text-xs uppercase tracking-wider"
              >
                Save Resume
              </Button>
            </div>
          </form>
        )
      )}

      {/* Inline Validation & Upload Errors Display */}
      {displayError && (
        <div className="flex items-start gap-2 p-3 border border-red-200/50 dark:border-red-950/30 rounded bg-red-50/20 dark:bg-red-950/10">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-mono text-red-600 dark:text-red-400 leading-relaxed">
            {displayError}
          </p>
        </div>
      )}
    </div>
  );
}
