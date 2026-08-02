"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { CtaButton } from "@/components/shared/cta-button";

type Props = { children: ReactNode; fallbackTitle?: string };
type State = { hasError: boolean; message?: string };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      // Dev-only diagnostics — never log in production builds via this guard
      void error;
      void info;
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center" role="alert">
        <h2 className="text-2xl font-extrabold text-navy">
          {this.props.fallbackTitle ?? "Something went wrong"}
        </h2>
        <p className="max-w-md text-sm text-muted">
          {this.state.message || "Please refresh the page or try again in a moment."}
        </p>
        <CtaButton
          label="Reload"
          onClick={() => {
            this.setState({ hasError: false, message: undefined });
            if (typeof window !== "undefined") window.location.reload();
          }}
        />
      </div>
    );
  }
}
