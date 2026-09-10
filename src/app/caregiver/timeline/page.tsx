"use client";

import * as React from "react";
import { AppShell } from "@/components/layout";
import { CaregiverShell, CombinedHealthTimeline } from "@/features/caregiver-portal";

const CURRENT_CAREGIVER = {
  id: "user-caregiver-001",
  name: "Anita Desai",
  email: "anita@caregiver.demo",
  role: "caregiver" as const,
  title: "Certified Nursing Assistant / Home Caregiver",
};

export default function CaregiverTimelinePage() {
  return (
    <AppShell
      activeRole="caregiver"
      user={CURRENT_CAREGIVER}
      showPatientHeader={false}
      showBreadcrumbs={false}
      containerSize="full"
    >
      <CaregiverShell>
        <CombinedHealthTimeline />
      </CaregiverShell>
    </AppShell>
  );
}
