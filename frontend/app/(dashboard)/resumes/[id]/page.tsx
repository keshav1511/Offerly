"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, AlertTriangle, User, FileText, Settings, Award, GraduationCap, Briefcase, FolderGit2, Link } from "lucide-react";

import { useResume, useStructuredResume, useUpdateStructuredResume } from "@/features/resume/hooks/useResumes";
import { structuredResumeSchema } from "@/features/resume/resume.validation";
import { PersonalInfoSection } from "@/features/resume/components/editor/PersonalInfoSection";
import { SummarySection } from "@/features/resume/components/editor/SummarySection";
import { SkillsSection } from "@/features/resume/components/editor/SkillsSection";
import { EducationSection } from "@/features/resume/components/editor/EducationSection";
import { ExperienceSection } from "@/features/resume/components/editor/ExperienceSection";
import { ProjectsSection } from "@/features/resume/components/editor/ProjectsSection";
import { CertificationsSection } from "@/features/resume/components/editor/CertificationsSection";
import { LanguagesSection } from "@/features/resume/components/editor/LanguagesSection";
import { LinksSection } from "@/features/resume/components/editor/LinksSection";
import { ResumeStructuredData } from "@/features/resume/types/parsing.types";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useToast } from "@/providers/ToastProvider";

type TabId = "personal" | "summary" | "skills" | "education" | "experience" | "projects" | "additional" | "links";

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "skills", label: "Skills", icon: Settings },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "additional", label: "Languages & Certs", icon: Award },
  { id: "links", label: "Links", icon: Link },
];

export default function ResumeEditorPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [nextAction, setNextAction] = useState<"back" | "tab" | null>(null);
  const [targetTab, setTargetTab] = useState<TabId | null>(null);

  // Queries & Mutations
  const { data: resume, isLoading: isResumeLoading } = useResume(id);
  const { data: structuredData, isLoading: isStructuredLoading } = useStructuredResume(id);
  const updateStructuredMutation = useUpdateStructuredResume(id);

  // Setup form
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ResumeStructuredData>({
    resolver: zodResolver(structuredResumeSchema) as unknown as Resolver<ResumeStructuredData>,
    mode: "onChange", // Performs inline validation on keystroke/change
  });

  // Load structured data when available
  useEffect(() => {
    if (structuredData) {
      reset(structuredData);
    }
  }, [structuredData, reset]);

  // Deep dirty check
  const currentValues = watch();
  const isDirty = React.useMemo(() => {
    if (!structuredData) return false;
    return JSON.stringify(structuredData) !== JSON.stringify(currentValues);
  }, [structuredData, currentValues]);

  // Block tab close/reloads when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  if (isResumeLoading || isStructuredLoading) {
    return (
      <div className="space-y-6 max-w-5xl py-8 animate-pulse font-sans">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
        <div className="h-4 w-96 bg-zinc-100 dark:bg-zinc-900 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3 col-span-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-900 rounded" />
            ))}
          </div>
          <div className="col-span-3 h-96 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800" />
        </div>
      </div>
    );
  }

  if (!resume || !structuredData) {
    return (
      <div className="p-8 text-center border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-xl mx-auto mt-20 bg-white dark:bg-zinc-950 font-sans">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
        <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50">
          Resume Not Found
        </h3>
        <p className="text-xs text-zinc-500 mt-2">
          The requested resume version does not exist or you do not have permission to view it.
        </p>
        <Button
          onClick={() => router.push("/resumes")}
          className="mt-6 font-mono text-xs uppercase tracking-wider"
        >
          Return to Catalog
        </Button>
      </div>
    );
  }

  // Handle saving form data
  const handleSave = async (data: ResumeStructuredData) => {
    try {
      await updateStructuredMutation.mutateAsync(data);
      toast("Structured resume data saved successfully.", "success");
      
      // If we saved through navigation trigger, execute the deferred action
      if (nextAction === "back") {
        router.push("/resumes");
      } else if (nextAction === "tab" && targetTab) {
        setActiveTab(targetTab);
      }
      setLeaveModalOpen(false);
      setNextAction(null);
      setTargetTab(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save edits.";
      toast(message, "error");
    }
  };

  // Back button handler
  const handleBack = () => {
    if (isDirty) {
      setNextAction("back");
      setLeaveModalOpen(true);
    } else {
      router.push("/resumes");
    }
  };

  // Sidebar tab click handler
  const handleTabClick = (tabId: TabId) => {
    if (activeTab === tabId) return;
    if (isDirty) {
      setNextAction("tab");
      setTargetTab(tabId);
      setLeaveModalOpen(true);
    } else {
      setActiveTab(tabId);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    reset(structuredData);
    setLeaveModalOpen(false);
    if (nextAction === "back") {
      router.push("/resumes");
    } else if (nextAction === "tab" && targetTab) {
      setActiveTab(targetTab);
    }
    setNextAction(null);
    setTargetTab(null);
  };

  return (
    <div className="space-y-8 max-w-5xl pb-24 font-sans">
      {/* Top Header */}
      <div className="space-y-5">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </button>

        <PageHeader
          title={`Edit Profile: ${resume.version_name}`}
          description={`Review and edit the parsed structured elements. Validates changes dynamically before writing to the database.`}
        />
      </div>

      <form onSubmit={handleSubmit(handleSave)} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar tabs */}
        <div className="col-span-1 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left font-mono text-xs uppercase tracking-wider border transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-sm"
                    : "bg-white dark:bg-zinc-950 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Editor panel */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          {activeTab === "personal" && (
            <PersonalInfoSection register={register} errors={errors} />
          )}
          {activeTab === "summary" && (
            <SummarySection register={register} errors={errors} />
          )}
          {activeTab === "skills" && (
            <SkillsSection setValue={setValue} watch={watch} />
          )}
          {activeTab === "education" && (
            <EducationSection register={register} errors={errors} control={control} />
          )}
          {activeTab === "experience" && (
            <ExperienceSection register={register} errors={errors} control={control} />
          )}
          {activeTab === "projects" && (
            <ProjectsSection register={register} errors={errors} control={control} />
          )}
          {activeTab === "additional" && (
            <div className="space-y-6">
              <CertificationsSection setValue={setValue} watch={watch} />
              <LanguagesSection setValue={setValue} watch={watch} />
            </div>
          )}
          {activeTab === "links" && (
            <LinksSection register={register} errors={errors} />
          )}

          {/* Fixed bottom controls */}
          <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-100 dark:border-zinc-900 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 font-mono text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <span className="text-zinc-400 dark:text-zinc-500">
                {isDirty ? "Unsaved changes detected" : "All changes saved"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={updateStructuredMutation.isPending}
                className="h-9 px-4 uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isDirty || updateStructuredMutation.isPending}
                className="h-9 px-4 flex items-center gap-1.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-black border-transparent uppercase tracking-wider"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{updateStructuredMutation.isPending ? "Saving..." : "Save Changes"}</span>
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Unsaved changes confirmation dialog */}
      <Modal
        isOpen={leaveModalOpen}
        onClose={() => {
          setLeaveModalOpen(false);
          setNextAction(null);
          setTargetTab(null);
        }}
        title="Unsaved Changes"
        className="max-w-md font-sans"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            You have unsaved changes in <span className="font-semibold text-zinc-950 dark:text-white font-mono">{TABS.find(t => t.id === activeTab)?.label}</span>. What would you like to do?
          </p>
          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-900 pt-4 mt-6">
            <Button
              variant="outline"
              onClick={handleDiscard}
              className="font-mono text-xs uppercase tracking-wider text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-200 dark:border-rose-800"
            >
              Discard
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setLeaveModalOpen(false);
                setNextAction(null);
                setTargetTab(null);
              }}
              className="font-mono text-xs uppercase tracking-wider"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(handleSave)}
              disabled={updateStructuredMutation.isPending}
              className="font-mono text-xs uppercase tracking-wider bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent hover:border-transparent"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
