import React, { useState, useCallback, useRef } from "react";
import { UploadCloud, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "../resume.validation";
import { Button } from "@/components/Button";

interface UploadZoneProps {
  onUpload: (file: File, versionName: string) => Promise<void>;
  isLoading?: boolean;
}

export function UploadZone({ onUpload, isLoading }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [versionName, setVersionName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract a friendly version name from file names
  const getCleanVersionName = (fileName: string) => {
    return fileName
      .replace(/\.[^/.]+$/, "") // Strip extension
      .replace(/[-_]/g, " ") // Replace dashes/underscores with spaces
      .trim();
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setError("Invalid file type. Only PDF and DOCX files are supported.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError("File is too large. Maximum size allowed is 5MB.");
      return;
    }

    setFile(selectedFile);
    setVersionName(getCleanVersionName(selectedFile.name));
  };

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
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !versionName.trim()) return;

    try {
      await onUpload(file, versionName.trim());
      // Reset state on success
      setFile(null);
      setVersionName("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload resume.");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`flex flex-col items-center justify-center border border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
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
            disabled={isLoading}
          />
          <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-3 bg-zinc-50 dark:bg-zinc-900 shadow-sm shrink-0">
            <UploadCloud className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-900 dark:text-zinc-50">
            Drag & Drop Resume
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
            PDF or DOCX (max. 5MB)
          </p>
        </div>
      ) : (
        /* File Selected & Version Name Form */
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
              onClick={() => {
                setFile(null);
                setError(null);
              }}
              disabled={isLoading}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Resume Version Name *
            </label>
            <input
              type="text"
              disabled={isLoading}
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
              disabled={isLoading}
              onClick={() => {
                setFile(null);
                setError(null);
              }}
              className="font-mono text-xs uppercase tracking-wider"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !versionName.trim()}
              className="font-mono text-xs uppercase tracking-wider"
            >
              {isLoading ? "Uploading..." : "Save Resume"}
            </Button>
          </div>
        </form>
      )}

      {/* Inline Errors Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 border border-red-200/50 dark:border-red-950/30 rounded bg-red-50/20 dark:bg-red-950/10">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-mono text-red-600 dark:text-red-400 leading-relaxed">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
