import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-background)",
        color: "var(--color-text-primary)",
        padding: "var(--space-6)",
        textAlign: "center",
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: "var(--color-surface-accent)",
          color: "var(--color-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-4)",
        }}
      >
        <AlertCircle size={28} />
      </div>

      <h1
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--font-size-2xl)",
          fontWeight: 700,
          color: "var(--color-primary)",
          margin: "0 0 var(--space-2) 0",
        }}
      >
        404 — Page Not Found
      </h1>

      <p
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--color-text-secondary)",
          maxWidth: 420,
          margin: "0 0 var(--space-6) 0",
          lineHeight: 1.5,
        }}
      >
        The page you are looking for does not exist or has been moved.
      </p>

      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Button asChild variant="primary" size="md">
          <Link
            href="/"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Home size={16} />
            <span>Home</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="md">
          <Link
            href="/patient"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <ArrowLeft size={16} />
            <span>Patient Portal</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
