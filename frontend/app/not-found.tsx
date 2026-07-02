import React from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-[75vh] nothing-dot-grid bg-background">
      <Container size="sm" className="text-center space-y-8">
        {/* Giant high contrast code indicator */}
        <div className="relative inline-block">
          <h1 className="font-mono text-8xl md:text-9xl font-extrabold tracking-tighter leading-none select-none text-foreground/5 dark:text-foreground/5">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-xs uppercase tracking-widest font-bold">
            RESOURCE NOT FOUND
          </div>
        </div>

        <div className="space-y-3 max-w-md mx-auto">
          <p className="text-xs text-muted-foreground leading-relaxed">
            The resource you are attempting to access does not exist or has been moved under new route conventions.
          </p>
          <div className="font-mono text-[9px] uppercase text-accent border border-accent/20 bg-accent/5 py-1 px-3 inline-block">
            STATUS CODE: 404_NOT_FOUND
          </div>
        </div>

        <div>
          <Link href="/">
            <Button variant="outline" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
