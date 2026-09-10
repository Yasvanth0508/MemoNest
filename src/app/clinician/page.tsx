"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout";
import { DoctorShell, DoctorPortalTab } from "@/features/doctor-portal";

const CURRENT_DOCTOR = {
  name: "Dr. Rajesh Sharma",
  role: "doctor" as const,
  title: "MD, Geriatric Medicine",
  email: "dr.sharma@hospital.demo",
};

function ClinicianPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab") as DoctorPortalTab | null;
  const initialTab: DoctorPortalTab = tabParam || "home";

  return <DoctorShell initialTab={initialTab} />;
}

export default function ClinicianWorkspacePage() {
  return (
    <AppShell
      activeRole="doctor"
      user={CURRENT_DOCTOR}
      showPatientHeader={false}
      showBreadcrumbs={false}
      showSidebar={false}
      containerSize="full"
    >
      <React.Suspense fallback={<div style={{ padding: 32 }}>Loading Doctor Workspace...</div>}>
        <ClinicianPageContent />
      </React.Suspense>
    </AppShell>
  );
}
