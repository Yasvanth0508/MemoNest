"use client";

import * as React from "react";
import Link from "next/link";
import { CaregiverProvider, CaregiverLoginView } from "@/features/caregiver-portal";
import { ArrowLeft, Activity } from "lucide-react";

export default function CaregiverLoginPage() {
  return (
    <CaregiverProvider>
      <div style={{ minHeight: "100vh", background: "var(--color-background)" }}>
        <header
          style={{
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "var(--color-primary)",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            <ArrowLeft size={16} />
            <span>Home</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={18} style={{ color: "var(--color-secondary)" }} />
            <span style={{ fontWeight: 800, color: "var(--color-primary)", fontSize: 16 }}>
              MemoNest Caregiver
            </span>
          </div>
        </header>

        <main>
          <CaregiverLoginView />
        </main>
      </div>
    </CaregiverProvider>
  );
}
