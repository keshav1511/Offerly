-- Migration: Add onboarding state columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS onboarding_step VARCHAR(50) DEFAULT 'resume' NOT NULL;
