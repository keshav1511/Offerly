"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { JobList } from "@/features/jobs/components/JobList";
import { JobWithCompany, JobRow } from "@/features/jobs/job.types";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { JobForm } from "@/features/jobs/components/JobForm";
import { Modal } from "@/components/Modal";
import { useToast } from "@/providers/ToastProvider";
import { Button } from "@/components/Button";
import { CreateJobInput } from "@/features/jobs/job.validation";

export default function JobsPage() {
  const { toast } = useToast();

  // Consume query mutations
  const {
    createJob,
    isCreating,
    updateJob,
    isUpdating,
    deleteJob,
    isDeleting,
  } = useJobs();

  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedJob, setSelectedJob] = useState<JobRow | null>(null);

  // Deletion Modal Target State
  const [deleteTarget, setDeleteTarget] = useState<JobWithCompany | null>(null);

  // Handlers for Form Triggers
  const handleCreateOpen = () => {
    setFormMode("create");
    setSelectedJob(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (job: JobWithCompany) => {
    setFormMode("edit");
    // Clone job object and delete joined company data to match JobRow structure safely
    const jobRow = { ...job };
    delete (jobRow as Partial<JobWithCompany>).company;
    
    setSelectedJob(jobRow as JobRow);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateJobInput) => {
    try {
      if (formMode === "create") {
        await createJob(data);
        toast(`Job "${data.title}" added to target catalog.`, "success");
      } else if (formMode === "edit" && selectedJob) {
        await updateJob({ id: selectedJob.id, input: data });
        toast(`Job "${data.title}" details updated.`, "success");
      }
      setIsFormOpen(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save job details.", "error");
    }
  };

  // Handlers for Deletion Confirmation
  const handleDeleteOpen = (job: JobWithCompany) => {
    setDeleteTarget(job);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteJob(deleteTarget.id);
      toast(`Job "${deleteTarget.title}" deleted successfully.`, "success");
      setDeleteTarget(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete job.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs Catalog"
        description="Track job listings, requirements, match results, and target deadlines."
      />

      {/* Grid List View */}
      <JobList
        onCreateClick={handleCreateOpen}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      {/* Create / Edit Modal Dialog */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === "create" ? "Track Open Position" : "Edit Job Tracking Profile"}
      >
        <JobForm
          initialData={selectedJob}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isCreating || isUpdating}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Job Listing"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Are you sure you want to remove <span className="font-semibold text-zinc-950 dark:text-white font-mono">{deleteTarget?.title}</span>? This action will soft-delete the job record and exclude it from your application analytics pipeline.
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
