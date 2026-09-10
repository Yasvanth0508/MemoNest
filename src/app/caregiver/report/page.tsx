"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout";
import { CaregiverShell, VoiceObservationInput } from "@/features/caregiver-portal";
import { ObservationCategory } from "@/types";
import { Loader2 } from "lucide-react";

const CURRENT_CAREGIVER = {
  id: "user-caregiver-001",
  name: "Anita Desai",
  email: "anita@caregiver.demo",
  role: "caregiver" as const,
  title: "Certified Nursing Assistant / Home Caregiver",
};

function VoiceObservationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category") as ObservationCategory | null;
  const tagParam = searchParams.get("tag") || undefined;
  const incidentParam = searchParams.get("incident") === "true";

  const resolvedCategory: ObservationCategory | undefined =
    categoryParam || (incidentParam ? "fall" : undefined);

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", width: "100%" }}>
      <VoiceObservationInput
        initialCategory={resolvedCategory}
        initialTag={tagParam || (incidentParam ? "Fall" : undefined)}
        onSuccess={() => router.push("/caregiver")}
        onCancel={() => router.push("/caregiver")}
      />
    </div>
  );
}

export default function CaregiverReportPage() {
  return (
    <AppShell
      activeRole="caregiver"
      user={CURRENT_CAREGIVER}
      showPatientHeader={false}
      showBreadcrumbs={false}
      containerSize="full"
    >
      <CaregiverShell>
        <React.Suspense
          fallback={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px",
                gap: "12px",
                color: "var(--color-text-secondary)",
              }}
            >
              <Loader2 className="animate-spin" size={20} />
              <span>Loading voice observation interface...</span>
            </div>
          }
        >
          <VoiceObservationPageContent />
        </React.Suspense>
      </CaregiverShell>
    </AppShell>
  );
}
