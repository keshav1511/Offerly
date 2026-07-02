"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { CompanyList } from "@/features/companies/components/CompanyList";
import { CompanyRow } from "@/features/companies/company.types";
import { CompanyForm } from "@/features/companies/components/CompanyForm";
import { Modal } from "@/components/Modal";
import { useToast } from "@/providers/ToastProvider";
import { useCompanies } from "@/features/companies/hooks/useCompanies";
import { Button } from "@/components/Button";
import { CreateCompanyInput } from "@/features/companies/company.validation";

export default function CompaniesPage() {
  const { toast } = useToast();
  
  // Custom queries & mutations hook
  const {
    createCompany,
    isCreating,
    updateCompany,
    isUpdating,
    deleteCompany,
    isDeleting,
  } = useCompanies();

  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCompany, setSelectedCompany] = useState<CompanyRow | null>(null);

  // Deletion Modal States
  const [deleteTarget, setDeleteTarget] = useState<CompanyRow | null>(null);

  // Handlers for Form Triggers
  const handleCreateOpen = () => {
    setFormMode("create");
    setSelectedCompany(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (company: CompanyRow) => {
    setFormMode("edit");
    setSelectedCompany(company);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateCompanyInput) => {
    try {
      if (formMode === "create") {
        await createCompany(data);
        toast(`Company "${data.name}" added successfully.`, "success");
      } else if (formMode === "edit" && selectedCompany) {
        await updateCompany({ id: selectedCompany.id, input: data });
        toast(`Company "${data.name}" updated successfully.`, "success");
      }
      setIsFormOpen(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save company details.", "error");
    }
  };

  // Handlers for Deletion Confirmation
  const handleDeleteOpen = (company: CompanyRow) => {
    setDeleteTarget(company);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCompany(deleteTarget.id);
      toast(`Company "${deleteTarget.name}" removed successfully.`, "success");
      setDeleteTarget(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete company.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description="Manage the corporations, offices, and targets you are tracking throughout your job search."
      />
      
      {/* List Grid View */}
      <CompanyList
        onCreateClick={handleCreateOpen}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      {/* Create / Edit Modal Dialog */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === "create" ? "Add Target Company" : "Edit Company Profile"}
      >
        <CompanyForm
          initialData={selectedCompany}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isCreating || isUpdating}
        />
      </Modal>

      {/* Custom Confirmation Deletion Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Company"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Are you sure you want to remove <span className="font-semibold text-zinc-950 dark:text-white font-mono">{deleteTarget?.name}</span>? This action will soft-delete the profile and remove it from your targeted pipeline dashboard list.
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
