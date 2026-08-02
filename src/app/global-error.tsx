"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      void error;
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#f6f8fc",
          color: "#111827",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1.5rem",
            textAlign: "center",
          }}
          role="alert"
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#08152f" }}>
            Application error
          </h2>
          <p style={{ maxWidth: "28rem", fontSize: "0.875rem", color: "#6b7280" }}>
            {error.message || "Something went wrong. Please reload the page."}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              borderRadius: 16,
              background: "#1e5eff",
              color: "#fff",
              border: "none",
              padding: "0.85rem 1.75rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
