"use client";

import React, { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";
import { cn } from "@/utils/cn";

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: boolean;
}

/**
 * OtpInput
 * 
 * Reusable 6-digit OTP passcode input component.
 * Features keyboard arrow controls, numeric-only validation, auto-focus jumping, 
 * clipboard paste parsing, disabled states, and clean focus outline classes.
 */
export function OtpInput({ value, onChange, disabled = false, error = false }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Strict numeric filtering
    const numericVal = val.replace(/[^0-9]/g, "");
    if (!numericVal && val) return; // ignore non-numeric entries

    const newOtp = [...value];
    newOtp[index] = numericVal.substring(numericVal.length - 1);
    onChange(newOtp);

    // Auto focus next input if digit entered
    if (numericVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        const newOtp = [...value];
        newOtp[index - 1] = "";
        onChange(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...value];
        newOtp[index] = "";
        onChange(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    // Keep only numeric characters up to 6 digits
    const cleanDigits = pasteData.replace(/[^0-9]/g, "").substring(0, 6);
    
    if (cleanDigits.length === 0) return;

    const newOtp = [...value];
    for (let i = 0; i < 6; i++) {
      if (i < cleanDigits.length) {
        newOtp[i] = cleanDigits[i];
      }
    }
    onChange(newOtp);

    // Auto-focus next field
    const focusIndex = Math.min(cleanDigits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-2.5 md:gap-3 max-w-sm mx-auto" role="group" aria-label="One-time verification code box block">
      {value.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => { inputRefs.current[idx] = el; }}
          type="text"
          pattern="[0-9]*"
          inputMode="numeric"
          value={digit}
          onChange={(e) => handleOtpChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={idx === 0 ? handlePaste : undefined}
          disabled={disabled}
          className={cn(
            "w-11 h-14 md:w-12 md:h-14 border bg-background font-mono text-xl text-center outline-none transition-colors rounded-none select-all",
            error 
              ? "border-destructive text-destructive focus:border-destructive focus:ring-1 focus:ring-destructive" 
              : "border-border text-foreground focus:border-accent focus:ring-1 focus:ring-accent",
            disabled && "opacity-50 cursor-not-allowed bg-secondary/25"
          )}
          aria-label={`Verification Digit ${idx + 1}`}
          maxLength={1}
          autoComplete="one-time-code"
          required
        />
      ))}
    </div>
  );
}
