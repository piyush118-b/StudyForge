"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GenerateErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AI Generation Error Caught by Boundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-red-400">Generation Halted</h3>
            <p className="text-sm text-slate-300 mt-1 max-w-sm">
              We encountered a strict formatting error from the AI. Don't worry, your inputs are saved.
            </p>
          </div>
          <Button variant="outline" className="border-red-500/50 hover:bg-red-500/10" onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
