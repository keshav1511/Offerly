"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { UploadZone } from "@/features/resume/components/UploadZone";
import { ResumeList } from "@/features/resume/components/ResumeList";
import { ResumeRow } from "@/features/resume/resume.types";
import { useResumes } from "@/features/resume/hooks/useResumes";
import { RenameForm } from "@/features/resume/components/RenameForm";
import { Modal } from "@/components/Modal";
import { useToast } from "@/providers/ToastProvider";
import { Button } from "@/components/Button";

export default function ResumesPage() {
  const { toast } = useToast();

  // Consume resumes queries & mutations
  const {
    updateResume,
    isUpdating,
    deleteResume,
    isDeleting,
    setDefaultResume,
    isSettingDefault,
  } = useResumes();

  // Modal / Form States
  const [renameTarget, setRenameTarget] = useState<ResumeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResumeRow | null>(null);


  // Rename handler
  const handleRename = async (data: { version_name: string }) => {
    if (!renameTarget) return;
    try {
      await updateResume({
        id: renameTarget.id,
        updates: { version_name: data.version_name },
      });
      toast(`Resume version renamed to "${data.version_name}".`, "success");
      setRenameTarget(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to rename resume.", "error");
    }
  };

  // Set default handler
  const handleSetDefault = async (resume: ResumeRow) => {
    try {
      await setDefaultResume(resume.id);
      toast(`"${resume.version_name}" is now set as your default resume.`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update default resume.", "error");
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteJobCascadeOrResumes(deleteTarget.id);
      toast(`Resume version "${deleteTarget.version_name}" deleted successfully.`, "success");
      setDeleteTarget(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete resume.", "error");
    }
  };

  const deleteJobCascadeOrResumes = async (id: string) => {
    await deleteResume(id);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-6">
        <PageHeader
          title="Resumes Manager"
          description="Upload and organize multiple resume versions. Track defaults, ATS scores, and target match alignments."
        />

        {/* Upload Zone */}
        <UploadZone />
      </div>

      <div className="space-y-4">
        <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
          Saved Resume Versions
        </h3>

        {/* Resumes List Grid */}
        <ResumeList
          onRename={setRenameTarget}
          onDelete={setDeleteTarget}
          onSetDefault={handleSetDefault}
          isActionLoading={isUpdating || isDeleting || isSettingDefault}
        />
      </div>

      {/* Rename Modal */}
      <Modal
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        title="Rename Resume Version"
        className="max-w-md"
      >
        {renameTarget && (
          <RenameForm
            resume={renameTarget}
            onSubmit={handleRename}
            onCancel={() => setRenameTarget(null)}
            isLoading={isUpdating}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Resume Version"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-zinc-950 dark:text-white font-mono">{deleteTarget?.version_name}</span>? This action will remove the file from storage and soft-delete its profile.
          </p>
          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-900 pt-4 mt-6">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteTarget(null)}
              className="font-mono text-xs uppercase tracking-wider"
            >
              Cancel
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="font-mono text-xs uppercase tracking-wider bg-red-600 hover:bg-red-750 dark:bg-red-950/80 dark:hover:bg-red-900 text-white dark:text-red-200 border-transparent hover:border-transparent"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
