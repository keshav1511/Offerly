"use client";

import React, { useEffect } from "react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/Card";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error telemetry
    console.error("Application Error Boundary caught exception:", error);
  }, [error]);

  return (
    <div className="flex-grow flex items-center justify-center min-h-[75vh] nothing-dot-grid bg-background py-12">
      <Container size="sm">
        <Card variant="glass" className="border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-none bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive font-bold">
              Application Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              A runtime exception was caught by the boundary.
            </p>
            {error.digest && (
              <div className="p-3 bg-secondary/80 text-[10px] font-mono border border-border text-muted-foreground select-all">
                DIGEST REFERENCE: {error.digest}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => (window.location.href = "/")} className="w-full sm:w-auto">
              Return Home
            </Button>
            <Button variant="primary" onClick={reset} className="w-full sm:w-auto">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </Container>
    </div>
  );
}
