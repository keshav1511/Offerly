import React from "react";
import Image from "next/image";
import { Container } from "@/components/Container";

export default function Loading() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-[70vh] nothing-dot-grid bg-background select-none">
      <Container size="sm" className="text-center space-y-6">
        <div className="inline-block relative">
          {/* Pulsing Offerly Icon branding */}
          <div className="relative h-12 w-12 mx-auto animate-pulse">
            <Image
              src="/images/logo/icon-primary.svg"
              alt="Offerly Loading Icon"
              width={48}
              height={48}
              className="dark:hidden block object-contain"
              priority
            />
            <Image
              src="/images/logo/icon-white.svg"
              alt="Offerly Loading Icon"
              width={48}
              height={48}
              className="hidden dark:block object-contain"
              priority
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <h2 className="font-mono text-xs uppercase tracking-widest font-bold">
            LOADING OFFERLY
          </h2>
          <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest animate-pulse">
            Establishing secure connection...
          </p>
        </div>
      </Container>
    </div>
  );
}
