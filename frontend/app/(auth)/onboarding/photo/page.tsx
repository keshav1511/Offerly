"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Upload, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthPageTransition } from "@/features/auth/components/AuthPageTransition";
import { useUpdateProfile } from "@/features/auth/hooks/useProfile";
import { useToast } from "@/providers/ToastProvider";
import { profileService } from "@/features/auth/services/profile.service";

function PhotoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId") || "";
  
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: updateProfile, mutateAsync: updateProfileAsync } = useUpdateProfile();

  useEffect(() => {
    updateProfile({ onboarding_step: "photo" });
  }, [updateProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please upload an image file (PNG, JPG, or WEBP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image must be smaller than 2MB.");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };
    reader.onerror = () => {
      setImageError("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    if (!imagePreview) return;
    setUploading(true);

    try {
      let finalAvatarUrl = imagePreview;

      if (selectedFile) {
        // Upload the avatar to storage and get its public URL
        finalAvatarUrl = await profileService.uploadAvatar(selectedFile);
      }

      await updateProfileAsync({
        avatar_url: finalAvatarUrl,
      });
      toast("Profile picture updated successfully.", "success");
      router.push(`/onboarding/success?resumeId=${resumeId}`);
    } catch (err) {
      setImageError("Failed to save avatar image.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    router.push(`/onboarding/success?resumeId=${resumeId}`);
  };

  const triggerFileInput = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <AuthPageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            <span>STEP: PROFILE_PICTURE</span>
            <span>4.8 / 5</span>
          </div>
          <div className="h-1 w-full bg-secondary flex gap-0.5" role="progressbar" aria-valuenow={95} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full w-[95%] bg-accent" />
            <div className="h-full w-[5%] bg-secondary" />
          </div>
        </div>

        <AuthCard>
          <AuthHeader
            title="PROFILE PICTURE"
            subtitle="Add a professional profile photo. You can also skip this step."
          />

          <div className="flex flex-col items-center justify-center space-y-6 py-4">
            {imagePreview ? (
              <div 
                onClick={triggerFileInput}
                className="h-28 w-28 rounded-full overflow-hidden border-2 border-accent relative group cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={imagePreview} 
                  alt="Avatar preview" 
                  className="h-full w-full object-cover" 
                />
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-foreground animate-pulse" />
                </div>
              </div>
            ) : (
              <div 
                onClick={triggerFileInput}
                className="h-28 w-28 rounded-full border border-dashed border-border bg-secondary/20 flex items-center justify-center cursor-pointer hover:border-accent hover:bg-secondary/40 transition-all group"
              >
                <Upload className="w-6 h-6 text-muted-foreground group-hover:text-foreground group-hover:scale-110 transition-all" />
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {!imagePreview ? (
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Click bubble to select profile image
              </p>
            ) : (
              <p className="font-mono text-[10px] text-accent uppercase tracking-wider">
                Ready to upload
              </p>
            )}
          </div>

          {imageError && (
            <div className="flex items-start gap-2 p-3 border border-destructive/20 rounded bg-destructive/5 text-left text-destructive font-mono text-[10px] uppercase">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{imageError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <AuthButton
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="w-full sm:w-1/3"
              disabled={uploading}
            >
              SKIP
            </AuthButton>
            <AuthButton
              type="button"
              variant="primary"
              onClick={imagePreview ? handleUploadSubmit : handleSkip}
              className="w-full sm:w-2/3 flex items-center justify-center gap-1.5"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> UPLOADING...
                </>
              ) : (
                <>
                  {imagePreview ? "UPLOAD & CONTINUE" : "CONTINUE WITHOUT PHOTO"}{" "}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </AuthButton>
          </div>
        </AuthCard>
      </div>
    </AuthPageTransition>
  );
}

export default function OnboardingPhotoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    }>
      <PhotoContent />
    </Suspense>
  );
}
